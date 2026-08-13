import express from "express";
const router = express.Router();

import { checkAuth } from "../auth/checkToken";

import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
} from "../auth/jwt";

import passport from "../auth/passport";

import validator from "../utils/validator";

import {
  login,
  usernameInUse,
  emailInUse,
  signup,
  refreshToken,
  logout,
  logoutEverywhere,
} from "../controls/authController";

import {
  getBCPillByMonthYear,
  takeBCPill,
  dltBCPIll,
} from "../controls/bcPillControl";

import {
  getCycleByMonthYear,
  trackCycle,
  dltCycle,
} from "../controls/cycleControl";

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
router.post("/api/signup", validator, signup);

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

// ======== PILL ======== \\
router.get("/api/pill/:month/:year", checkAuth, getBCPillByMonthYear);
router.post("/api/track/pill", checkAuth, takeBCPill);
router.delete("/api/pill/:pillid", checkAuth, dltBCPIll);

// ======== CYCLEs ======== \\
router.get("/api/cycle/:month/:year", checkAuth, getCycleByMonthYear);
router.post("/api/track/period", checkAuth, trackCycle);
router.delete("/api/cycle/:cycleID", checkAuth, dltCycle);

// ======== SETTINGS ======== \\
router.get("/api/settings", checkAuth, getSettings);
router.patch("/api/update/icon", checkAuth);
// dont rememebr what color is atm \\
router.patch("/api/update/color", checkAuth);
router.patch("/api/update/settings", checkAuth, settingsUpdate);

// ======== DLT ACC ======== \\
router.delete("/api/delete/account", checkAuth);

module.exports = router;
