import prisma from "../prisma/client";
import { passwordGenie, checkPassword } from "../utils/passwordUtil";

async function getSettings(req, res) {
  try {
    const userID = Number(req.user.userID);
    const settings = await prisma.user.findUnique({
      where: {
        userID,
      },
      select: {
        name: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(400).json({ noUser: "This user does not exist" });
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function settingsUpdate(req, res) {
  try {
    const userID = Number(req.user.userID);
    const { name, username, email } = req.body;

    if (name === "" && username === "" && email === "") {
      return res.status(400).json({ error: "Cannot update with empty values" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userID,
      },
    });

    if (username && username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already taken" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(email && { email }),
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function changePassword(req, res) {
  try {
    const userID = Number(req.user.userID);
    const { oldPassword, password } = req.body;

    const user = await prisma.settings.findUnique({
      where: { userID: userID },
    });

    const match = await checkPassword(oldPassword, user.saltedHash);

    if (!match) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const newPassword = await passwordGenie(password);

    await prisma.settings.update({
      where: { userID: userID },
      data: { saltedHash: newPassword },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}
// ------- cycle info + algs  \\
async function getCycleInfo(req, res) {
  try {
    const userID = Number(req.user.userID);

    const cycleInfo = await prisma.settings.findUnique({
      where: {
        userID: userID,
      },
      select: {
        cycleLength: true,
        daysBetweenPeriod: true,
        ovulationPrediction: true,
      },
    });

    if (!cycleInfo) {
      return res.status(200).json({ noInfo: "Nothing is entered" });
    }

    return res.status(200).json(cycleInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function updateCycleInfo(req, res) {
  try {
    const userID = Number(req.user.userID);
    const cycleLength = Number(req.body.cyclelength);
    const daysBetweenPeriod = Number(req.body.daysbetweenperiod);

    if (isNaN(cycleLength) || isNaN(daysBetweenPeriod)) {
      return res.status(400).json({
        message:
          "Cycle lengths and days between your period have to be numbers",
      });
    }

    const updatedSettings = await prisma.settings.update({
      where: {
        userID: userID,
      },
      data: {
        ...(cycleLength && { cycleLength }),
        ...(daysBetweenPeriod && { daysBetweenPeriod }),
      },
    });

    return res.status(200).json(updatedSettings);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function dltAccount(req, res) {
  try {
    const userID = Number(req.user.userID);
    await prisma.user.delete({
      where: {
        id: userID,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

module.exports = {
  getSettings,
  settingsUpdate,
  changePassword,
  getCycleInfo,
  updateCycleInfo,
  dltAccount,
};
