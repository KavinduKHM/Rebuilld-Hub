const express = require("express");
const router = express.Router();
const disasterController = require("../../controllers/disasterController/DisasterController");
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

// Update disaster
router.put("/:id", disasterController.updateDisaster);

// Delete disaster
router.delete("/:id", disasterController.deleteDisaster);

module.exports = router;