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
        date: {
          gte: startOfMonth, // >= Aug 1
          lt: startOfNextMonth, // < Sep 1
        },
      },
      orderBy: {
        date: "asc",
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

    const todaysDate = new Date();
    const dateToTrack = new Date(date);

    if (dateToTrack > todaysDate) {
      return res
        .status(400)
        .json({ error: "Cannot track beyond today's date" });
    }

    const monthNum = dateToTrack.getMonth(); // 0-11
    const yearNum = dateToTrack.getFullYear();

    const startOfMonth = new Date(yearNum, monthNum, 1);
    const startOfNextMonth = new Date(yearNum, monthNum + 1, 1);

    // Check if there are any existing markings for this month
    const existingMarkingsThisMonth = await prisma.cycleTracking.findMany({
      where: {
        userID,
        startDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
    });

    const isFirstMarkingOfMonth = existingMarkingsThisMonth.length === 0;

    // Create the cycle tracking entry
    const today = await prisma.cycleTracking.create({
      data: {
        userID,
        startDate: dateToTrack,
      },
    });

    // If this is the first marking of the month, update predictions
    if (isFirstMarkingOfMonth) {
      await updatePredictions(userID, dateToTrack);
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

// Helper function to update period end and ovulation predictions
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

async function dltCycle(req, res) {
  try {
    const userID = Number(req.user.userID);
    const cycleID = Number(req.params.cycleID);

    const deleted = await prisma.cycleTracking.delete({
      where: {
        id: cycleID,
        userID,
      },
    });

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
};
