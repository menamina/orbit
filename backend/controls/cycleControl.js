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

    // Calculate ovulation dates for this month
    const ovulationDates = await calculateOvulationDatesForMonth(
      userID,
      monthNum,
      yearNum,
      data?.settings?.ovulationPrediction,
    );

    return res.status(200).json({
      ...data,
      ovulationDates,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function trackCycle(req, res) {
  try {
    const userID = Number(req.user.userID);
    const cycleDays = req.body;

    for (const obj of cycleDays) {
      if (isNaN(obj.id) || isNaN(obj.date)) {
        return res.status(400).json({ error: "Invalid date" });
      }
    }

    if (cycleDays.length === 0) {
      return res.status(200).json({ success: true });
    }

    for (const obj of cycleDays) {
      if (obj.id) {
        const deleted = await prisma.cycleDay.delete({
          where: { id: obj.id },
        });
      } else if (!obj.id) {
        const dateToTrack = validateAndNormalizeDate(obj.date);
        if (!dateToTrack) {
          return res.status(400).json({ error: "Invalid date" });
        }

        const created = await prisma.cycleDay.create({
          data: {
            userID,
            date: dateToTrack,
          },
        });
      }
    }

    await updatePredictionsBasedOnActualData(userID);

    return res.status(200).json({ success: true });
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
    return false;
  }

  if (dateToTrack > todaysDate) {
    return false;
  }

  // Normalize to midnight
  dateToTrack.setHours(0, 0, 0, 0);
  return dateToTrack;
}

// prediction: Update based on actual historical cycle data
async function updatePredictionsBasedOnActualData(userID) {
  try {
    const allDays = await prisma.cycleDay.findMany({
      where: { userID },
      orderBy: { date: "asc" },
    });

    if (allDays.length < 5) return;

    // Find periods by detecting gaps > 7 days
    const periods = [];
    let periodStart = new Date(allDays[0].date);
    let periodEnd = new Date(allDays[0].date);

    for (let i = 1; i < allDays.length; i++) {
      const currentDate = new Date(allDays[i].date);
      const prevDate = new Date(allDays[i - 1].date);
      const dayGap = (currentDate - prevDate) / (1000 * 60 * 60 * 24);

      if (dayGap > 7) {
        periods.push({ start: periodStart, end: periodEnd });
        periodStart = currentDate;
      }
      periodEnd = currentDate;
    }

    periods.push({ start: periodStart, end: periodEnd });

    if (periods.length < 2) return;

    // Calculate averages
    const periodLengths = periods.map(
      (p) => Math.ceil((p.end - p.start) / (1000 * 60 * 60 * 24)) + 1,
    );

    const cycleGaps = periods
      .slice(0, -1)
      .map((p, i) => (periods[i + 1].start - p.start) / (1000 * 60 * 60 * 24));

    const avgPeriodLength = Math.round(
      periodLengths.reduce((a, b) => a + b) / periodLengths.length,
    );
    const avgCycleLength = Math.round(
      cycleGaps.reduce((a, b) => a + b) / cycleGaps.length,
    );

    await prisma.settings.update({
      where: { userID },
      data: {
        cycleLength: avgPeriodLength,
        daysBetweenPeriod: avgCycleLength,
        ovulationPrediction: avgCycleLength - 14,
      },
    });
  } catch (error) {
    console.log("Error updating predictions:", error);
  }
}

async function calculateOvulationDatesForMonth(
  userID,
  monthNum,
  yearNum,
  ovulationPrediction,
) {
  if (!ovulationPrediction) return [];

  try {
    const allDays = await prisma.cycleDay.findMany({
      where: { userID },
      orderBy: { date: "asc" },
    });

    if (allDays.length === 0) return [];

    // Find period starts by detecting 7+ day gaps
    const periodStarts = [new Date(allDays[0].date)];

    for (let i = 1; i < allDays.length; i++) {
      const currentDate = new Date(allDays[i].date);
      const prevDate = new Date(allDays[i - 1].date);
      const dayGap = (currentDate - prevDate) / (1000 * 60 * 60 * 24);

      if (dayGap > 7) {
        periodStarts.push(currentDate);
      }
    }

    // Calculate ovulation dates and filter for requested month
    const ovulationDatesInMonth = [];
    periodStarts.forEach((periodStart) => {
      const ovulationDate = new Date(periodStart);
      ovulationDate.setDate(ovulationDate.getDate() + ovulationPrediction);

      if (
        ovulationDate.getMonth() + 1 === monthNum &&
        ovulationDate.getFullYear() === yearNum
      ) {
        ovulationDatesInMonth.push(ovulationDate.getDate());
      }
    });

    return ovulationDatesInMonth;
  } catch (error) {
    console.log("Error calculating ovulation dates:", error);
    return [];
  }
}

export {
  getCycleByMonthYear,
  trackCycle,
  updatePredictionsBasedOnActualData,
  validateAndNormalizeDate,
};
