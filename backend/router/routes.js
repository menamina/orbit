const express = require("express");
const router = express.Router();
import {
  login,
  usernameInUse,
  emailInUse,
  signup,
  refreshToken,
  logout,
  logoutEverywhere,
} from "../controls/authController";

import { checkAuth } from "../auth/checkToken";
import passport from "../auth/passport";
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
} from "../auth/jwt";

// ======== AUTH ======== \\

router.get("/", checkAuth, (req, res) => {
  res.json({ authenticated: true });
});

router.post("/api/checkRefreshToken", refreshToken);

router.get("/api/signup/isUsernameInUse", usernameInUse);
router.get("/api/signup/isEmailInUse", emailInUse);
router.post("/api/signup", signup);

router.post("/api/login", login);

// GitHub OAuth - Initiate authentication
router.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

// GitHub OAuth - Callback after GitHub authentication
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login", session: false }),
  async (req, res) => {
    try {
      // req.user comes from passport strategy
      const user = req.user;

      // Generate JWT tokens
      const accessToken = generateAccessToken(user.id, user.email);
      const refreshTokenValue = generateRefreshToken();

      // Store refresh token
      await storeRefreshToken(user.id, refreshTokenValue);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", refreshTokenValue, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Redirect to frontend with access token
      // Frontend will extract token from URL and store it
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/login?error=oauth_failed");
    }
  }
);

router.post("/api/logout", logout);
router.post("/api/logoutEverywhere", logoutEverywhere);

// ======== PILL ======== \\
router.get("/api/pill/:month/:year", checkAuth);
router.post("/api/track/pill", checkAuth);
router.delete("/api/track/pill/delete/:pillID", checkAuth);

// ======== CYCLEs ======== \\
router.get("/api/cycle/:month/:year", checkAuth);
router.post("/api/track/period");
router.delete("/api/track/pill/delete/:pillID", checkAuth);

// ======== SETTINGS ======== \\
router.get("/api/settings", checkAuth);
router.patch("/api/update/icon", checkAuth);
router.patch("/api/update/color", checkAuth);
router.patch("/api/update/password", checkAuth);
router.patch("/api/update/email", checkAuth);

// ======== DLT ACC ======== \\
router.delete("/api/delete/account", checkAuth);

module.exports = router;
