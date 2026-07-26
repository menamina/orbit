const express = require("express");
const router = express.Router();
import {
  login,
  usernameInUse,
  emailInUse,
  signup,
} from "../controls/authController";

// ======== AUTH ======== \\

router.get("/");
router.get("/api/signup/isUsernameInUse", usernameInUse);
router.get("/api/signup/isEmailInUse", emailInUse);
router.get("/api/signup", signup);
router.get("/api/login", login);
router.get("/api/logout");

// ======== PILL ======== \\
router.get("/api/pill/:month/:year");
router.post("/api/track/pill");
router.delete("/api/track/pill/delete/:pillID");

// ======== CYCLEs ======== \\
router.get("/api/cycle/:month/:year");
router.post("/api/track/period");
router.delete("/api/track/pill/delete/:pillID");

// ======== SETTINGS ======== \\
router.get("/api/settings");
router.patch("/api/update/icon");
router.patch("/api/update/color");
router.patch("/api/update/password");
router.patch("/api/update/email");

// ======== DLT ACC ======== \\
router.delete("/api/delete/account");

module.exports = router;
