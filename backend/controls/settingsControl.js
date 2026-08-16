import prisma from "../prisma/client.js";
import { passwordGenie, checkPassword } from "../utils/passwordUtil.js";

async function getSettings(req, res) {
  try {
    const userID = Number(req.user.userID);
    const user = await prisma.user.findUnique({
      where: {
        id: userID,
      },
      select: {
        name: true,
        username: true,
        email: true,
        settings: {
          select: {
            icon: true,
            appColor: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      name: user.name,
      username: user.username,
      email: user.email,
      icon: user.settings?.icon,
      appColor: user.settings?.appColor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function settingsUpdate(req, res) {
  try {
    const userID = Number(req.user.userID);
    const { name, username, email, icon, appColor } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: userID,
      },
      include: {
        settings: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found - please login" });
    }

    if (username && username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return res.status(403).json({ error: "Username already taken" });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(403).json({ error: "Email already taken" });
      }
    }

    await prisma.user.update({
      where: { id: userID },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(email && { email }),
        ...((icon || appColor) && {
          settings: {
            update: {
              ...(icon && { icon }),
              ...(appColor && { appColor }),
            },
          },
        }),
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
      where: { userID },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "User does not exist - please login" });
    }

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
      return res.status(200).json({ noInfo: "Nothing is entered yet" });
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
    const cycleLength = Number(req.body.cycleLength);
    const daysBetweenPeriod = Number(req.body.daysBetweenPeriod);

    const settings = await prisma.settings.findUnique({
      where: { userID: userID },
    });

    if (!settings) {
      return res.status(400).json({ message: "User settings not found" });
    }

    if (isNaN(cycleLength) || isNaN(daysBetweenPeriod)) {
      return res.status(403).json({
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

export {
  getSettings,
  settingsUpdate,
  changePassword,
  getCycleInfo,
  updateCycleInfo,
  dltAccount,
};
