import prisma from "../prisma/client.js";

const PAGINATION_LIMIT = 10;

async function getCurrentPack(req, res) {
  try {
    const userID = Number(req.user.userID);
    const currentPack = await prisma.pillPack.findFirst({
      where: {
        userID,
        isComplete: false,
      },
      include: {
        pills: {
          orderBy: {
            dayNumber: "asc",
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return res.status(200).json(currentPack);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function getAllPacks(req, res) {
  try {
    const userID = Number(req.user.userID);
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : 0;
    const limit = PAGINATION_LIMIT;

    const packs = await prisma.pillPack.findMany({
      where: {
        userID,
      },
      include: {
        pills: {
          orderBy: {
            dayNumber: "asc",
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
      skip: cursor,
      take: limit + 1, // Fetch one extra to check if there's a next page
    });

    const hasNextPage = packs.length > limit;
    const packsToReturn = hasNextPage ? packs.slice(0, limit) : packs;
    const nextCursor = hasNextPage ? cursor + limit : undefined;

    return res.status(200).json({
      packs: packsToReturn,
      nextCursor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getPackByNumber(req, res) {
  try {
    const userID = Number(req.user.userID);
    const packID = Number(req.params.packID);
    const packNumber = Number(req.params.packNumber);

    const foundPack = await prisma.pillPack.findFirst({
      where: {
        id: packID,
        userID,
        packNumber,
      },
      include: {
        pills: {
          orderBy: {
            dayNumber: "asc",
          },
        },
      },
    });

    if (!foundPack) {
      return res.status(200).json({ nothingFound: "No pill pack was found" });
    }

    return res.status(200).json(foundPack);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function startNewPack(req, res) {
  try {
    const userID = Number(req.user.userID);
    const lastPackNumber = await prisma.pillPack.findFirst({
      where: {
        userID,
      },
      orderBy: {
        packNumber: "desc",
      },
    });

    const newPackNumber = lastPackNumber ? lastPackNumber.packNumber + 1 : 1;

    const newPackStarted = await prisma.pillPack.create({
      data: {
        userID,
        packNumber: newPackNumber,
        startDate: new Date(),
      },
    });

    return res.status(200).json(newPackStarted);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function trackPillInPack(req, res) {
  try {
    const userID = Number(req.user.userID);
    const dayNumber = Number(req.body.dayNumber);
    const date = Number(req.body.date);

    const trackedPill = await prisma.pillTracking.create({
      data: {
        pillPackID,
        dayNumber,
        date: new Date(date),
      },
    });

    return res.status(200).json(trackedPill);
  } catch {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function dltBCPIll(req, res) {
  try {
    const userID = Number(req.user.userID);
    const pillID = Number(req.params.pillID);

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

async function dltPack(req, res) {
  try {
    const userID = Number(req.user.userID);
    const packID = Number(req.params.packID);

    const pack = await prisma.pillPack.findUnique({
      where: { id: packID },
    });

    if (!pack) {
      return res.status(404).json({ error: "Pack record not found" });
    }

    if (pack.userID !== userID) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this record" });
    }

    await prisma.pillPack.delete({
      where: { id: packID },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

export {
  getCurrentPack,
  getAllPacks,
  getPackByNumber,
  startNewPack,
  trackPillInPack,
  dltBCPIll,
  dltPack,
};
