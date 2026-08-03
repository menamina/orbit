import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../prisma/client.js";
require("dotenv").config();

const accessTokenSec = process.env.ACCESS_SECRET;
const accessExpiry = process.env.ACCESS_EXPIRES_IN;
const refreshExpiry = process.env.REFRESH_EXPIRES_IN;

function generateAccessToken(userID, email) {
  return jwt.sign({ userID, email }, accessTokenSec, {
    expiresIn: accessExpiry,
  });
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

async function storeRefreshToken(userID, token) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Number(refreshExpiry));
  return await prisma.refreshToken.create({
    data: {
      token,
      userID,
      expiresAt,
    },
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, accessTokenSec);
  } catch (error) {
    return null;
  }
}

async function verifyRefreshToken(token) {
  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      return null;
    }

    if (new Date() > refreshToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
      return null;
    }

    return refreshToken;
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    return null;
  }
}

async function deleteRefreshToken(token) {
  try {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  } catch (error) {
    console.error("Error deleting refresh token:", error);
  }
}

async function deleteAllRefreshTokens(userID) {
  try {
    await prisma.refreshToken.deleteMany({
      where: { userID: userID },
    });
  } catch (error) {
    console.error("Error deleting all refresh tokens:", error);
  }
}

export {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  deleteRefreshToken,
  deleteAllRefreshTokens,
};
