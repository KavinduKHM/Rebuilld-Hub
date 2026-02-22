const express = require("express");
const router = express.Router();
const controller = require("../../controllers/disasterController/damageReportController");

// Create Damage Report
router.post("/", controller.createReport);

// Get Reports by Disaster
router.get("/disaster/:disasterId", controller.getReportsByDisaster);

// Verify Report (Authority Only)
router.patch("/verify/:id", controller.verifyReport);

module.exports = router;