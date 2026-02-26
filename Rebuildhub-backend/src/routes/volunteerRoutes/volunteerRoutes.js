import express from "express";
const router = express.Router();

import {
  registerVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
} from "../../controllers/volunteerController/volunteerController.js";

// Import validation
import {
  registerVolunteerValidation,
  validate,
} from "../../validations/volunteerValidation/volunteerValidation.js";

console.log("✅ Volunteer routes loaded with validation");

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

export default router;
