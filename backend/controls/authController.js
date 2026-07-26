const prisma = require("../prisma/client");
import { passwordGenie, checkPassword } from "../utils/passwordUtil";

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        settings: {
          select: {
            saltedHash: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(400).json({ invalidEmail: "Email is invalid" });
    }

    const validPassword = await checkPassword(
      password,
      user.settings.saltedHash,
    );

    if (!validPassword) {
      res.status(400).json({ invalidPassword: "Password invalid" });
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken();

    await storeRefreshToken(user.id, refreshToken);
    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    return res.json({ accessToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function usernameInUse(req, res) {
  try {
    const { username } = req.body;
    const inUse = await prisma.user.findUnique({ where: { username } });
    if (!inUse) {
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ message: "Username in use" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function emailInUse(req, res) {
  try {
    const { email } = req.body;
    const inUse = await prisma.user.findUnique({ where: { email } });
    if (!inUse) {
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ message: "Email in use" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function signup(req, res) {
  try {
    const { name, username, email, password } = req.body;
    const saltedHash = passwordGenie(password);
    const user = prisma.user.create({
      data: {
        name,
        username,
        email,
        profile: {
          create: saltedHash,
        },
      },
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

module.exports = {
  login,
  usernameInUse,
  emailInUse,
  signup,
};
