import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// YOUR routes (keep these)
import volunteerRoutes from "./routes/volunteerRoutes/volunteerRoutes.js";
import eventRoutes from "./routes/eventRoutes/eventRoutes.js";

// OTHER TEAM MEMBER'S routes (add these)
import disasterRoutes from "./routes/disasterRoutes/DisasterRoutes.js";
import damageReportRoutes from "./routes/disasterRoutes/DamageReportRoutes.js";
import nasaRoutes from "./routes/disasterRoutes/nasaRoutes.js";
import authRoutes from "./routes/authRoutes/authRoutes.js";
import aidRoutes from "./routes/aidRoutes/aidRoutes.js";
import weatherRoutes from "./routes/weatherRoutes/weatherRoutes.js";

// Load env
dotenv.config();

const app = express();

// CORS configuration - combined version
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url}`);
  next();
});

// ===== ALL ROUTES =====
// YOUR routes
if (volunteerRoutes) {
  app.use("/api/volunteers", volunteerRoutes);
  console.log("✅ Volunteer routes mounted at /api/volunteers");
}

app.use("/api/events", eventRoutes);
console.log("✅ Event routes mounted at /api/events");

// OTHER TEAM MEMBER'S routes
app.use("/api/disasters", disasterRoutes);
app.use("/api/reports", damageReportRoutes);
app.use("/api/external", nasaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/aids", aidRoutes);
app.use("/api/weather", weatherRoutes);

// Health check with ALL endpoints
app.get("/", (req, res) => {
  res.json({
    message: "API is running...",
    version: "1.0.0",
    endpoints: {
      // Your endpoints
      volunteers: "GET /api/volunteers",
      register: "POST /api/volunteers/register",
      volunteerById: "GET /api/volunteers/:id",
      updateVolunteer: "PUT /api/volunteers/:id",
      deleteVolunteer: "DELETE /api/volunteers/:id",
      test: "GET /api/volunteers/test",
      debug: "GET /api/volunteers/debug",
      events: "GET /api/events",

      // Other team's endpoints
      disasters: "GET /api/disasters",
      reports: "GET /api/reports",
      external: "GET /api/external",
      auth: "POST /api/auth/login",
      aids: "GET /api/aids",
      weather: "GET /api/weather",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

export default app;
