import express from "express";
const router = express.Router();

import { checkAuth } from "../auth/checkToken.js";

import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
} from "../auth/jwt.js";

import passport from "../auth/passport.js";

import { validateSignup } from "../utils/validator.js";
import { passwordValidator } from "../utils/passwordValidation.js";

import {
  login,
  usernameInUse,
  emailInUse,
  signup,
  refreshToken,
  logout,
  logoutEverywhere,
} from "../controls/authController.js";

import {
  getCurrentPack,
  getAllPacks,
  getPackByNumber,
  startNewPack,
  trackPillInPack,
  dltBCPIll,
  dltPack,
} from "../controls/bcPillControl.js";

import {
  getCycleByMonthYear,
  trackCycle,
  dltCycle,
} from "../controls/cycleControl.js";

import {
  getSettings,
  settingsUpdate,
  changePassword,
  getCycleInfo,
  updateCycleInfo,
  dltAccount,
} from "../controls/settingsControl.js";

import {
  getNotes,
  writeNote,
  updateNote,
  dltNote,
} from "../controls/notesController.js";

// ======== AUTH ======== \\

router.get("/", checkAuth, (req, res) => {
  res.status(200).json({
    authenticated: true,
    user: {
      id: req.user.userID,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

router.post("/api/checkRefreshToken", refreshToken);

router.get("/api/signup/username", usernameInUse);
router.get("/api/signup/email", emailInUse);
router.post("/api/signup", validateSignup, signup);

router.post("/api/login", login);

// GitHub OAuth - Initiate authentication
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

// GitHub OAuth - Callback after GitHub authentication
router.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user;

      // Generate JWT tokens
      const accessToken = generateAccessToken(user.id, user.email);
      const refreshTokenValue = generateRefreshToken();

      // Store refresh token
      await storeRefreshToken(user.id, refreshTokenValue);

      res.cookie("refreshToken", refreshTokenValue, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Redirect to frontend with access token
      // Frontend will extract token from URL and store it
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`,
      );
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/login?error=oauth_failed");
    }
  },
);

router.post("/api/logout", logout);
router.post("/api/logoutEverywhere", logoutEverywhere);

// ======== PILL PACKS ======== \\
router.get("/api/pill-pack/current", checkAuth, getCurrentPack);
router.get("/api/all-packs", checkAuth, getAllPacks);
router.get("/api/pill-pack/:packID/:packNumber", checkAuth, getPackByNumber);
router.post("/api/new-blister-packs", checkAuth, startNewPack);
router.post("/api/track-pill/:packID", checkAuth, trackPillInPack);
router.delete("/api/dltPill/:pillID", checkAuth, dltBCPIll);
router.delete("/api/dltPack/:packID", checkAuth, dltPack);

// ======== CYCLE ======== \\
router.get("/api/cycle/:month/:year", checkAuth, getCycleByMonthYear);
router.post("/api/track/period", checkAuth, trackCycle);
router.delete("/api/cycle/:cycleID", checkAuth, dltCycle);

// ======== NOTES ======== \\
router.get("/api/notes/:month/:year", checkAuth, getNotes);
router.post("/api/writeNote", checkAuth, writeNote);
router.patch("/api/updateNote", checkAuth, updateNote);
router.delete("/api/deleteNote", checkAuth, dltNote);

// ======== SETTINGS ======== \\
router.get("/api/settings", checkAuth, getSettings);
// need multer for img \\
router.patch("/api/updateSettings", checkAuth, settingsUpdate);
router.patch(
  "/api/updatePassword",
  checkAuth,
  passwordValidator,
  changePassword,
);
router.get("/api/getCycleInfo", checkAuth, getCycleInfo);
router.patch("/api/updateCycleInfo", checkAuth, updateCycleInfo);

// ======== DLT ACC ======== \\
router.delete("/api/delete/account", checkAuth, dltAccount);

export default router;
