import express from "express";
import {
  fetchAndStoreEvents,
  getEvents,
  getEventById,
  expressInterest,
  getCategories,
} from "../../controllers/eventController/eventController.js";

const router = express.Router();

console.log("✅ Event routes loaded");

// Public routes (for demo/development)
// In production, add authentication middleware

// Fetch and store events from NASA
// GET /api/events/fetch?location=worldwide|srilanka
router.get("/fetch", fetchAndStoreEvents);

// Get all events with filters
// GET /api/events?location=worldwide&category=floods&days=30&limit=50
router.get("/", getEvents);

// Get event categories
router.get("/categories", getCategories);

// Get single event by ID
router.get("/:id", getEventById);

// Volunteer expresses interest in an event
// POST /api/events/:id/interest
router.post("/:id/interest", expressInterest);

export default router;
