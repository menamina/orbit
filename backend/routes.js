const express = require("express");
const router = express.Router();

router.get("/");
router.get("/api/login");

router.get("/api/month/:month/:year");

// ======== PILL ======== \\
router.post("/api/track/pill");
router.delete("/api/track/pill/delete/:pillID");

// ======== CYCLEs ======== \\
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
