import express from "express";
import {
  fetchAndStoreEvents,
  getEvents,
  getEventById,
  expressInterest,
  getCategories,
  getLiveEvents,
  getLiveSriLankaEvents,
  getLiveEventsMap,
  getLiveEventsMapViewer,
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

// Live endpoints (no MongoDB write)
// GET /api/events/live?location=worldwide|srilanka&category=floods&days=30&limit=100
router.get("/live", getLiveEvents);

// GET /api/events/live/srilanka?category=floods&days=30&limit=100
router.get("/live/srilanka", getLiveSriLankaEvents);

// GET /api/events/live/map?location=worldwide&category=floods
router.get("/live/map", getLiveEventsMap);

// GET /api/events/live/map/view?location=worldwide&category=all
router.get("/live/map/view", getLiveEventsMapViewer);

// Get single event by ID
router.get("/:id", getEventById);

// Volunteer expresses interest in an event
// POST /api/events/:id/interest
router.post("/:id/interest", expressInterest);

export default router;
