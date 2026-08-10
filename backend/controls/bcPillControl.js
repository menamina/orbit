import prisma from "../prisma/client";

async function getBCPillByMonthYear(req, res) {
  try {
    const userID = Number(req.user.userID);
    const monthNum = Number(req.params.month);
    const yearNum = Number(req.params.year);

    const startOfMonth = new Date(yearNum, monthNum - 1, 1);
    const startOfNextMonth = new Date(yearNum, monthNum, 1);

    const monthOfPills = await prisma.pillTracking.findMany({
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

    return res.status(200).json(monthOfPills);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function takeBCPill(req, res) {
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

    const today = await prisma.pillTracking.create({
      data: {
        userID,
        date: dateToTrack,
      },
    });

    res.status(200).json(today);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function dltBCPIll(req, res) {
  try {
    const userID = Number(req.user.userID);
    const pillID = Number(req.params.pillid);

    const deleted = await prisma.pillTracking.delete({
      where: {
        id: pillID,
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
  getBCPillByMonthYear,
  takeBCPill,
  dltBCPIll,
};
