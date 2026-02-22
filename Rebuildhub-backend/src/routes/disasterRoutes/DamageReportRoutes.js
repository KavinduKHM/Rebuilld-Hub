const express = require("express");
const router = express.Router();
const controller = require("../../controllers/disasterController/damageReportController");
const { validate } = require("../middlewares/validationMiddleware");
const {
  createDamageReportValidation,
} = require("../../validators/damageReportValidator");

// Create Damage Report (with validation)
router.post(
  "/",
  createDamageReportValidation,
  validate,
  controller.createReport
);

// Get Reports by Disaster
router.get("/disaster/:disasterId", controller.getReportsByDisaster);

// Verify Report (Authority Only - later RBAC)
router.patch("/verify/:id", controller.verifyReport);

module.exports = router;