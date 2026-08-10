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

    // Normalize to start of day for duplicate checking
    const startOfDay = new Date(dateToTrack.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateToTrack.setHours(23, 59, 59, 999));

    const isDayAlreadyEntered = await prisma.pillTracking.findFirst({
      where: {
        userID,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (isDayAlreadyEntered) {
      return res
        .status(400)
        .json({ error: "Pill already tracked for this date" });
    }

    const today = await prisma.pillTracking.create({
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

async function dltBCPIll(req, res) {
  try {
    const userID = Number(req.user.userID);
    const pillID = Number(req.params.pillid);

    const pill = await prisma.pillTracking.findUnique({
      where: { id: pillID },
    });

    if (!pill) {
      return res.status(404).json({ error: "Pill record not found" });
    }

    if (pill.userID !== userID) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this record" });
    }

    await prisma.pillTracking.delete({
      where: { id: pillID },
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
