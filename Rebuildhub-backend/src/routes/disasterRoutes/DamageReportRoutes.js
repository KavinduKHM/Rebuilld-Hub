const express = require("express");
const router = express.Router();
const controller = require("../../controllers/disasterController/DamageReportController");
const upload = require("../../middlewares/uploadMiddleware");
const authMiddleware = require("../../middlewares/authMiddleware");
const { adminOnly } = authMiddleware;
const { validate } = require("../../middlewares/ValidationMiddleware");
const {
  createDamageReportValidation,
} = require("../../validations/DamageReportValidator");

// Create Damage Report with Image Upload + Validation
router.post("/", upload.array("images", 5), controller.createReport);

// Get Reports by Disaster
router.get("/disaster/:disasterId", controller.getReportsByDisaster);

// Get single report by id
router.get("/:id", controller.getReportById);

// Verify Report (Authority Workflow)
router.patch("/verify/:id", authMiddleware, adminOnly, controller.verifyReport);

module.exports = router;