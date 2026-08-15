import prisma from "../prisma/client.js";

import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  deleteAllRefreshTokens,
  deleteRefreshToken,
} from "../auth/jwt.js";

import { passwordGenie, checkPassword } from "../utils/passwordUtil.js";

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
      return res
        .status(400)
        .json({ invalidEmail: "Email is invalid or not in use" });
    }

    const validPassword = await checkPassword(
      password,
      user.settings.saltedHash,
    );

    if (!validPassword) {
      return res.status(400).json({ invalidPassword: "Invalid password" });
    }

    const userINFO = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    };

    const accessToken = generateAccessToken(
      user.id,
      user.name,
      user.username,
      user.email,
    );
    const refreshToken = generateRefreshToken();

    await storeRefreshToken(user.id, refreshToken);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ accessToken, userINFO });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function usernameInUse(req, res) {
  try {
    const { username } = req.query;
    const userID = Number(req.user.userID);

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
    const { email } = req.query;
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
    const saltedHash = await passwordGenie(password);

    // Create user with settings (for password) and local account
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        settings: {
          create: {
            saltedHash,
          },
        },
        accounts: {
          create: {
            provider: "local",
            providerId: email, // Use email as identifier for local auth
          },
        },
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function logout(req, res) {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }

  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out successfully" });
}

async function logoutEverywhere(req, res) {
  const userID = Number(req.user.userID);
  await deleteAllRefreshTokens(userID);
  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out from all devices" });
}

async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.cookies;
    // ^ sent by browser w http

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" });
    }
    // if there is no refresh token it is expired
    // and user is logged out and must log back in

    // however if there is a refresh token -
    // lets check if its expired or not
    const tokenData = await verifyRefreshToken(refreshToken);

    if (!tokenData) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }
    // if it just so happens to be invalid when we check ..
    // user is logged out and must log back in

    // if the token is there and valid
    // Generate new access token
    const newAccessToken = generateAccessToken(
      tokenData.user.id,
      tokenData.user.name,
      tokenData.user.username,
      tokenData.user.email,
    );

    return res.status(200).json({ newAccessToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

export {
  login,
  usernameInUse,
  emailInUse,
  signup,
  refreshToken,
  logout,
  logoutEverywhere,
};
