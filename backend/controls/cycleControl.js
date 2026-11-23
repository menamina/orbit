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

    // cycle dates are stored as DATE columns (UTC midnight), so use UTC bounds
    const startOfMonth = new Date(Date.UTC(yearNum, monthNum - 1, 1));
    const startOfNextMonth = new Date(Date.UTC(yearNum, monthNum, 1));

    const data = await prisma.user.findUnique({
      where: {
        id: userID,
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

    // Format cycleDays dates to YYYY-MM-DD strings
    const formattedCycleDays = data?.cycleDays?.map((day) => ({
      id: day.id,
      date: day.date.toISOString().split('T')[0],
    })) || [];

    return res.status(200).json({
      cycleDays: formattedCycleDays,
      settings: data?.settings || null,
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

    if (!Array.isArray(cycleDays)) {
      return res.status(400).json({ error: "Expected an array of cycle days" });
    }

    if (cycleDays.length === 0) {
      return res.status(200).json({ success: true });
    }

    // validate everything before touching the database
    const toDelete = [];
    const toCreate = [];

    for (const obj of cycleDays) {
      if (obj?.id !== undefined && obj?.id !== null) {
        const id = Number(obj.id);
        if (!Number.isInteger(id)) {
          return res.status(400).json({ error: "Invalid cycle day id" });
        }
        toDelete.push(id);
        continue;
      }

      let normalized;
      try {
        normalized = validateAndNormalizeDate(obj?.date);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }

      // store as UTC midnight so the DATE column keeps the calendar day the user picked
      toCreate.push(
        new Date(
          Date.UTC(
            normalized.getFullYear(),
            normalized.getMonth(),
            normalized.getDate(),
          ),
        ),
      );
    }

    if (toDelete.length > 0) {
      // scoped to userID so users can only delete their own days
      await prisma.cycleDay.deleteMany({
        where: { id: { in: toDelete }, userID },
      });
    }

    for (const date of toCreate) {
      await prisma.cycleDay.upsert({
        where: { userID_date: { userID, date } },
        update: {},
        create: { userID, date },
      });
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
  todaysDate.setHours(0, 0, 0, 0);

  // "YYYY-MM-DD" strings are parsed as UTC by JS, which shifts the day in
  // timezones behind UTC — build them as local dates instead
  const dateOnly = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const dateToTrack = dateOnly
    ? new Date(...date.split("-").map((n, i) => (i === 1 ? Number(n) - 1 : Number(n))))
    : new Date(date);

  if (isNaN(dateToTrack.getTime())) {
    throw new Error("Invalid date format");
  }

  // Normalize to midnight
  dateToTrack.setHours(0, 0, 0, 0);

  if (dateToTrack > todaysDate) {
    throw new Error("Cannot track beyond today's date");
  }

  return dateToTrack;
}

function shouldCreateNewCycle(lastCycle, newDate) {
  // No previous cycle exists
  if (!lastCycle) {
    return true;
  }

  // Use UTC date components to avoid timezone issues
  const lastStartDate = new Date(lastCycle.startDate);
  const lastUTC = Date.UTC(
    lastStartDate.getFullYear(),
    lastStartDate.getMonth(),
    lastStartDate.getDate()
  );

  const newTrackDate = new Date(newDate);
  const newUTC = Date.UTC(
    newTrackDate.getFullYear(),
    newTrackDate.getMonth(),
    newTrackDate.getDate()
  );

  // Calculate days between dates
  const daysDifference = Math.floor(
    (newUTC - lastUTC) / (1000 * 60 * 60 * 24)
  );

  // Create new cycle if:
  // 1. New date is before last cycle (negative days)
  // 2. More than 10 days have passed
  return daysDifference < 0 || daysDifference > 10;
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
  shouldCreateNewCycle,
};
