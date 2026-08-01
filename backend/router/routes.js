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

// ======== AUTH ======== \\

router.get("/", checkAuth, (req, res) => {
  res.json({ authenticated: true });
});

router.post("/api/checkRefreshToken", refreshToken);

router.get("/api/signup/isUsernameInUse", usernameInUse);
router.get("/api/signup/isEmailInUse", emailInUse);
router.post("/api/signup", signup);

router.post("/api/login", login);
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
