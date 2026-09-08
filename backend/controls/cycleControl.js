import prisma from "../prisma/client.js";

async function getCycleByMonthYear(req, res) {
  try {
    const userID = Number(req.user.userID);
    const monthNum = Number(req.params.month);
    const yearNum = Number(req.params.year);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: "Invalid month" });
    }

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ error: "Invalid year" });
    }

    const startOfMonth = new Date(yearNum, monthNum - 1, 1);
    const startOfNextMonth = new Date(yearNum, monthNum, 1);

    const data = await prisma.user.findUnique({
      where: {
        userID,
      },
      select: {
        cycleDays: {
          where: {
            date: {
              gte: startOfMonth,
              lt: startOfNextMonth,
            },
          },
          orderBy: {
            date: "asc",
          },
        },
        settings: {
          select: {
            ovulationPrediction: true,
            daysBetweenPeriod: true,
            cycleLength: true,
          },
        },
      },
    });

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function trackCycle(req, res) {
  try {
    const userID = Number(req.user.userID);
    const { date } = req.body;

    const dateToTrack = validateAndNormalizeDate(date);

    // Check if this day already exists
    const existing = await prisma.cycleDay.findUnique({
      where: {
        userID_date: {
          userID,
          date: dateToTrack,
        },
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "Day already tracked for this date" });
    }

    // Create the cycle day
    const cycleDay = await prisma.cycleDay.create({
      data: {
        userID,
        date: dateToTrack,
      },
    });

    // Update predictions based on all cycle data
    await updatePredictionsBasedOnActualData(userID);

    res.status(200).json(cycleDay);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
}

function validateAndNormalizeDate(date) {
  if (!date) {
    throw new Error("Date is required");
  }

  const todaysDate = new Date();
  const dateToTrack = new Date(date);

  if (isNaN(dateToTrack.getTime())) {
    throw new Error("Invalid date format");
  }

  if (dateToTrack > todaysDate) {
    throw new Error("Cannot track beyond today's date");
  }

  // Normalize to midnight
  dateToTrack.setHours(0, 0, 0, 0);
  return dateToTrack;
}

// Adaptive prediction: Update based on actual historical cycle data
async function updatePredictionsBasedOnActualData(userID) {
  try {
    // Get all cycle days ordered by date
    const allCycleDays = await prisma.cycleDay.findMany({
      where: {
        userID,
      },
      orderBy: {
        date: "asc",
      },
    });

    if (allCycleDays.length < 5) {
      // Not enough data to calculate meaningful averages
      return;
    }

    // Group consecutive days into periods
    const periods = [];
    let currentPeriod = null;

    for (const day of allCycleDays) {
      const dayDate = new Date(day.date);

      if (!currentPeriod) {
        // Start new period
        currentPeriod = {
          startDate: dayDate,
          endDate: dayDate,
          days: [dayDate],
        };
      } else {
        const lastDate = currentPeriod.endDate;
        const daysDiff = Math.ceil(
          (dayDate - lastDate) / (1000 * 60 * 60 * 24),
        );

        if (daysDiff <= 2) {
          // Continue current period (allow 1 day gap for irregular periods)
          currentPeriod.endDate = dayDate;
          currentPeriod.days.push(dayDate);
        } else {
          // Start new period
          periods.push(currentPeriod);
          currentPeriod = {
            startDate: dayDate,
            endDate: dayDate,
            days: [dayDate],
          };
        }
      }
    }

    if (currentPeriod) {
      periods.push(currentPeriod);
    }

    if (periods.length < 2) {
      return;
    }

    // Calculate average period length (how many days bleeding lasts)
    const periodLengths = periods.map((period) => period.days.length);
    const avgPeriodLength = Math.round(
      periodLengths.reduce((sum, len) => sum + len, 0) / periodLengths.length,
    );

    // Calculate days between periods (cycle length)
    const cycleGaps = [];
    for (let i = 0; i < periods.length - 1; i++) {
      const currentStart = periods[i].startDate;
      const nextStart = periods[i + 1].startDate;
      const diffTime = Math.abs(nextStart - currentStart);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      cycleGaps.push(diffDays);
    }

    const avgDaysBetweenPeriod = Math.round(
      cycleGaps.reduce((sum, gap) => sum + gap, 0) / cycleGaps.length,
    );

    // Update settings with calculated averages
    await prisma.settings.update({
      where: { userID },
      data: {
        cycleLength: avgPeriodLength,
        daysBetweenPeriod: avgDaysBetweenPeriod,
        ovulationPrediction: avgDaysBetweenPeriod - 14, // Ovulation typically 14 days before next period
      },
    });
  } catch (error) {
    console.log("Error updating predictions based on actual data:", error);
  }
}

async function dltCycle(req, res) {
  try {
    const userID = Number(req.user.userID);
    const cycleID = Number(req.params.cycleID);

    if (isNaN(cycleID) || cycleID <= 0) {
      return res.status(400).json({ error: "Invalid cycle ID" });
    }

    const cycleDay = await prisma.cycleDay.findUnique({
      where: { id: cycleID },
    });

    if (!cycleDay) {
      return res.status(404).json({ error: "Cycle day not found" });
    }

    if (cycleDay.userID !== userID) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this record" });
    }

    await prisma.cycleDay.delete({
      where: { id: cycleID },
    });

    // Recalculate predictions based on remaining data
    await updatePredictionsBasedOnActualData(userID);

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
}

export {
  getCycleByMonthYear,
  trackCycle,
  dltCycle,
  updatePredictionsBasedOnActualData,
  validateAndNormalizeDate,
};
