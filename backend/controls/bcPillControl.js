import prisma from "../prisma/client";

async function getBCPillByMonthYear(req, res) {
  const { month, year } = req.body;
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function takeBCPill(req, res) {
  try {
    const { id } = req.user.id;
    const userID = Number(id);
    const today = await prisma.pillTracking.create({
      data: {
        userID,
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
    const { pill } = req.body;
    const pillID = Number(pill);

    const deleted = await prisma.pillTracking.delete({
      where: {
        id: pillID,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}
