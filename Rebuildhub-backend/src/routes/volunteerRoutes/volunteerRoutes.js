const express = require("express");
const router = express.Router();

const {
  registerVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
} = require("../../controllers/volunteerController/volunteerController");

// Import validation
const {
  registerVolunteerValidation,
  validate,
} = require("../../validations/volunteerValidation/volunteerValidation");


// Test routes
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Test route working",
    time: new Date().toISOString(),
  });
});

router.get("/debug", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Debug route working",
    time: new Date().toISOString(),
  });
});

// ===== MAIN CRUD ROUTES =====
// GET all volunteers
router.get("/", getAllVolunteers);

// POST register new volunteer WITH VALIDATION
router.post(
  "/register",
  registerVolunteerValidation, // Array of validation middlewares
  validate, // Error checker that calls next()
  registerVolunteer, // Your controller
);

// GET volunteer by ID
router.get("/:id", getVolunteerById);

// PUT update volunteer
router.put("/:id", updateVolunteer);

// DELETE volunteer
router.delete("/:id", deleteVolunteer);

module.exports = router;
