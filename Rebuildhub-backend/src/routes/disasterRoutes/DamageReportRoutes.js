const express = require("express");
const router = express.Router();
const controller = require("../../controllers/disasterController/DamageReportController");
const upload = require("../../middlewares/uploadMiddleware");
const { validate } = require("../../middlewares/ValidationMiddleware");
const {
  createDamageReportValidation,
} = require("../../validations/DamageReportValidator");

// Create Damage Report with Image Upload + Validation
router.post("/", upload.array("images", 5), controller.createReport);

// Get Reports by Disaster
router.get("/disaster/:disasterId", controller.getReportsByDisaster);

// Verify Report (Authority Workflow)
router.patch("/verify/:id", controller.verifyReport);

module.exports = router;