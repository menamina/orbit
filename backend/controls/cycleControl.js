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

// async function cycleInfo(req, res) {
//   try {
//   } catch (error) {}
// }

// async function updateCycleInfo(req, res) {
//   try {
//   } catch (error) {}
// }

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

    const today = await prisma.cycleTracking.create({
      data: {
        userID,
        date: new Date(date),
      },
    });

    res.status(200).json(today);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
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
};
