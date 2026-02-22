const express = require("express");
const router = express.Router();
const disasterController = require("../../controllers/disasterController/DisasterController");
const { validate } = require("../middlewares/validationMiddleware");
const {
  createDisasterValidation,
} = require("../../validators/disasterValidator");

// Create disaster (with validation)
router.post(
  "/",
  createDisasterValidation,
  validate,
  disasterController.createDisaster
);

// Get all disasters
router.get("/", disasterController.getAllDisasters);

// Get single disaster
router.get("/:id", disasterController.getSingleDisaster);

// Update disaster
router.put("/:id", disasterController.updateDisaster);

// Delete disaster
router.delete("/:id", disasterController.deleteDisaster);

module.exports = router;