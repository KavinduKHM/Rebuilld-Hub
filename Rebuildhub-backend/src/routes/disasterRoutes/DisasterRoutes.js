const express = require("express");
const router = express.Router();
const disasterController = require("../../controllers/disasterController/DisasterController");
// const { protect } = require("../middlewares/auth.middleware");
// const { authorizeRoles } = require("../middlewares/role.middleware");

// Create disaster (Admin/Authority)
router.post("/", disasterController.createDisaster);

// Get all disasters (Public)
router.get("/", disasterController.getAllDisasters);

// Get single disaster
router.get("/:id", disasterController.getSingleDisaster);

// Update disaster
router.put("/:id", disasterController.updateDisaster);

// Delete disaster
router.delete("/:id", disasterController.deleteDisaster);

module.exports = router;