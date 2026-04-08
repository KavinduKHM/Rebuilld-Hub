const express = require("express");
const router = express.Router();
const disasterController = require("../../controllers/disasterController/DisasterController");
const authMiddleware = require("../../middlewares/authMiddleware");
const { adminOnly } = authMiddleware;
const { validate } = require("../../middlewares/ValidationMiddleware");
const {
  createDisasterValidation,
} = require("../../validations/DisasterValidator");
const upload = require("../../middlewares/uploadMiddleware");

// Create disaster (with validation)
router.post("/", upload.array("images", 5), disasterController.createDisaster);

// Get all disasters
router.get("/", disasterController.getAllDisasters);

// Get single disaster
router.get("/:id", disasterController.getSingleDisaster);

// Verify disaster (admin only)
router.patch("/verify/:id", authMiddleware, adminOnly, disasterController.verifyDisaster);

// Assign volunteer to a disaster (approved volunteers only)
router.post("/:id/assign-volunteer", disasterController.assignVolunteer);

// Update disaster (with optional image upload)
router.put("/:id", upload.array("images", 5), disasterController.updateDisaster);

// Delete disaster
router.delete("/:id", disasterController.deleteDisaster);

module.exports = router;