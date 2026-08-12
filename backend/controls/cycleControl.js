import prisma from "../prisma/client";

async function getCycleByMonthYear(req, res) {
  try {
    const userID = Number(req.user.userID);
    const monthNum = Number(req.params.month);
    const yearNum = Number(req.params.year);

    const startOfMonth = new Date(yearNum, monthNum - 1, 1);
    const startOfNextMonth = new Date(yearNum, monthNum, 1);

    const cycleMonth = await prisma.cycleTracking.findMany({
      where: {
        userID: userID,
        startDate: {
          gte: startOfMonth, // >= Aug 1
          lt: startOfNextMonth, // < Sep 1
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return res.status(200).json(cycleMonth);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function trackCycle(req, res) {
  try {
    const userID = Number(req.user.userID);
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const todaysDate = new Date();
    const dateToTrack = new Date(date);

    if (isNaN(dateToTrack.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (dateToTrack > todaysDate) {
      return res
        .status(400)
        .json({ error: "Cannot track beyond today's date" });
    }

    const startOfDay = new Date(dateToTrack);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateToTrack);
    endOfDay.setHours(23, 59, 59, 999);

    const isDayAlreadyEntered = await prisma.cycleTracking.findFirst({
      where: {
        userID,
        startDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (isDayAlreadyEntered) {
      return res
        .status(400)
        .json({ error: "Cycle already tracked for this date" });
    }

    const monthNum = dateToTrack.getMonth(); // 0-11
    const yearNum = dateToTrack.getFullYear();

    const startOfMonth = new Date(yearNum, monthNum, 1);
    const startOfNextMonth = new Date(yearNum, monthNum + 1, 1);

    const userData = await prisma.user.findUnique({
      where: { id: userID },
      include: {
        settings: true,
        cycleTracking: {
          where: {
            startDate: {
              gte: startOfMonth,
              lt: startOfNextMonth,
            },
          },
          orderBy: {
            startDate: "asc",
          },
        },
      },
    });

    const settings = userData?.settings;
    const isFirstMarkingOfMonth = userData.cycleTracking.length === 0;

    // Calculate estimated end date if settings exist
    let estEndDate = null;
    if (settings && settings.cycleLength) {
      // Use the original date string to avoid mutation issues
      estEndDate = new Date(date);
      estEndDate.setHours(0, 0, 0, 0);
      estEndDate.setDate(estEndDate.getDate() + settings.cycleLength);
    }

    // Normalize the date to midnight before storing
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const today = await prisma.cycleTracking.create({
      data: {
        userID,
        startDate: normalizedDate,
        endDate: estEndDate,
      },
    });

    // If this is the first marking of the month, update initial predictions
    if (isFirstMarkingOfMonth) {
      await updatePredictions(userID, new Date(date));
    } else {
      // Check if actual cycle differs from expected and update predictions
      await updatePredictionsBasedOnActualData(userID);
    }

    res.status(200).json({
      ...today,
      isFirstMarkingOfMonth,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

// Helper function to update period end and ovulation predictions based on settings
async function updatePredictions(userID, startDate) {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userID },
    });

    if (!settings || !settings.cycleLength || !settings.daysBetweenPeriod) {
      console.log("Missing cycle settings for predictions");
      return;
    }

    // Calculate when the period ends (startDate + cycleLength)
    // cycleLength = how many days you bleed (e.g., 5 days)
    // JavaScript Date automatically handles month boundaries
    // Example: Jan 27 + 5 days = Feb 1
    const predictedEndDate = new Date(startDate);
    predictedEndDate.setDate(predictedEndDate.getDate() + settings.cycleLength);

    // Calculate ovulation date (typically 14 days before next period)
    // daysBetweenPeriod = total cycle length (e.g., 28-35 days)
    // Next period starts at: startDate + daysBetweenPeriod
    // So ovulation is: startDate + (daysBetweenPeriod - 14)
    const predictedOvulationDate = new Date(startDate);
    predictedOvulationDate.setDate(
      predictedOvulationDate.getDate() + (settings.daysBetweenPeriod - 14),
    );

    // Calculate next cycle start date
    const nextCycleDate = new Date(startDate);
    nextCycleDate.setDate(nextCycleDate.getDate() + settings.daysBetweenPeriod);

    // Store predictions as day offsets from period start
    const ovulationPrediction = settings.daysBetweenPeriod - 14;
    const nextCyclePrediction = settings.daysBetweenPeriod;

    // Update the predictions in the database
    await prisma.settings.update({
      where: { userID },
      data: {
        ovulationPrediction,
        nextCyclePrediction,
      },
    });

    return {
      predictedEndDate,
      predictedOvulationDate,
      nextCycleDate,
    };
  } catch (error) {
    console.log("Error updating predictions:", error);
  }
}

// Adaptive prediction: Update based on actual historical cycle data
async function updatePredictionsBasedOnActualData(userID) {
  try {
    // Get the last 3 completed cycles to calculate averages
    const recentCycles = await prisma.cycleTracking.findMany({
      where: {
        userID,
        endDate: { not: null }, // Only completed cycles
      },
      orderBy: {
        startDate: "desc",
      },
      take: 3,
    });

    if (recentCycles.length < 2) {
      // Not enough data to calculate averages yet
      return;
    }

    // Calculate actual cycle lengths (how many days bleeding lasted)
    const periodLengths = recentCycles.map((cycle) => {
      const start = new Date(cycle.startDate);
      const end = new Date(cycle.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    });

    // Calculate average period length
    const avgPeriodLength = Math.round(
      periodLengths.reduce((sum, len) => sum + len, 0) / periodLengths.length,
    );

    // Calculate days between periods (cycle length)
    const cycleGaps = [];
    for (let i = 0; i < recentCycles.length - 1; i++) {
      const currentStart = new Date(recentCycles[i].startDate);
      const nextStart = new Date(recentCycles[i + 1].startDate);
      const diffTime = Math.abs(currentStart - nextStart);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      cycleGaps.push(diffDays);
    }

    let avgDaysBetweenPeriod = null;
    if (cycleGaps.length > 0) {
      avgDaysBetweenPeriod = Math.round(
        cycleGaps.reduce((sum, gap) => sum + gap, 0) / cycleGaps.length,
      );
    }

    // Update settings with learned data
    const updateData = {
      cycleLength: avgPeriodLength,
      ovulationPrediction: avgDaysBetweenPeriod
        ? avgDaysBetweenPeriod - 14
        : undefined,
      nextCyclePrediction: avgDaysBetweenPeriod || undefined,
    };

    if (avgDaysBetweenPeriod) {
      updateData.daysBetweenPeriod = avgDaysBetweenPeriod;
    }

    await prisma.settings.update({
      where: { userID },
      data: updateData,
    });

    console.log(
      `Updated predictions for user ${userID}: avgPeriodLength=${avgPeriodLength}, avgCycle=${avgDaysBetweenPeriod}`,
    );
  } catch (error) {
    console.log("Error updating predictions based on actual data:", error);
  }
}

async function dltCycle(req, res) {
  try {
    const userID = Number(req.user.userID);
    const cycleID = Number(req.params.cycleID);

    // First verify the cycle belongs to this user
    const cycle = await prisma.cycleTracking.findUnique({
      where: { id: cycleID },
    });

    if (!cycle) {
      return res.status(404).json({ error: "Cycle record not found" });
    }

    if (cycle.userID !== userID) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this record" });
    }

    // Delete the cycle
    await prisma.cycleTracking.delete({
      where: { id: cycleID },
    });

    // Recalculate predictions based on remaining data
    await updatePredictionsBasedOnActualData(userID);

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

module.exports = {
  getCycleByMonthYear,
  trackCycle,
  dltCycle,
  updatePredictions,
  updatePredictionsBasedOnActualData,
};
