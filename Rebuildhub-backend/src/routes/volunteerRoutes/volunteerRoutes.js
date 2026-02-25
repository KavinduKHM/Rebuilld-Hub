import express from "express";
const router = express.Router();

import {
  registerVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
} from "../../controllers/volunteerController/volunteerController.js";

console.log("✅ Volunteer routes loaded");

// Test routes (remove these later if not needed)
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
// GET all volunteers - This will now show database data
router.get("/", getAllVolunteers);

// POST register new volunteer
router.post("/register", registerVolunteer);

// GET volunteer by ID
router.get("/:id", getVolunteerById);

// PUT update volunteer
router.put("/:id", updateVolunteer);

// DELETE volunteer
router.delete("/:id", deleteVolunteer);

export default router;
