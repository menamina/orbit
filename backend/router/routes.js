const express = require("express");
const router = express.Router();
import {
  login,
  usernameInUse,
  emailInUse,
  signup,
  refreshToken,
  logout,
} from "../controls/authController";

import { checkAuth } from "../utils/checkToken";

// ======== AUTH ======== \\

router.get("/", checkAuth);
router.get("/api/checkRefreshToken", refreshToken);

router.get("/api/signup/isUsernameInUse", usernameInUse);
router.get("/api/signup/isEmailInUse", emailInUse);
router.get("/api/signup", signup);

router.get("/api/login", login);
router.get("/api/logout", logout);

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
