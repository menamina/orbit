import prisma from "../prisma/client";

async function getBCPillByMonthYear(req, res) {
  try {
    const { userid, mo, yr } = req.params;
    const userID = Number(userid);
    const month = Number(mo);
    const year = Number(yr);

    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);

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
    const { id, date } = req.body;
    const userID = Number(id);
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
    const { userid, pill } = req.params;

    const userID = Number(userid);
    const pillID = Number(pill);

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
