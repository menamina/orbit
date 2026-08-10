import prisma from "../prisma/client";

async function getCycleByMonthYear(req, res) {
  try {
    const { id, mo, yr } = req.body;
    const userID = Number(id);
    const month = Number(mo);
    const year = Number(yr);

    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);

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

    return res.status(200).json(cyleMonth);
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
    const { id, date } = req.body;
    const userID = Number(id);
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
    const { cycleid } = req.body;
    const cycleID = Number(cycleid);

    const deleted = await prisma.cycleTracking.delete({
      where: {
        id: cycleID,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}
