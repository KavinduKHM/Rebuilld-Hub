import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// YOUR routes (keep these)
import volunteerRoutes from "./routes/volunteerRoutes/volunteerRoutes.js";
import eventRoutes from "./routes/eventRoutes/eventRoutes.js";

// Load env
dotenv.config();

const app = express();

const loadOptionalRoute = async (modulePath, routeName) => {
  try {
    const routeModule = await import(modulePath);
    return routeModule.default || null;
  } catch (error) {
    console.warn(`⚠️ Skipping ${routeName}: ${error.message}`);
    return null;
  }
};

// OTHER TEAM MEMBER'S routes (optional load so app can boot even if some are CommonJS)
const disasterRoutes = await loadOptionalRoute(
  "./routes/disasterRoutes/DisasterRoutes.js",
  "disasterRoutes",
);
const damageReportRoutes = await loadOptionalRoute(
  "./routes/disasterRoutes/DamageReportRoutes.js",
  "damageReportRoutes",
);
const nasaRoutes = await loadOptionalRoute(
  "./routes/disasterRoutes/nasaRoutes.js",
  "nasaRoutes",
);
const authRoutes = await loadOptionalRoute(
  "./routes/authRoutes/authRoutes.js",
  "authRoutes",
);
const aidRoutes = await loadOptionalRoute(
  "./routes/aidRoutes/aidRoutes.js",
  "aidRoutes",
);
const weatherRoutes = await loadOptionalRoute(
  "./routes/weatherRoutes/weatherRoutes.js",
  "weatherRoutes",
);

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
if (disasterRoutes) app.use("/api/disasters", disasterRoutes);
if (damageReportRoutes) app.use("/api/reports", damageReportRoutes);
if (nasaRoutes) app.use("/api/external", nasaRoutes);
if (authRoutes) app.use("/api/auth", authRoutes);
if (aidRoutes) app.use("/api/aids", aidRoutes);
if (weatherRoutes) app.use("/api/weather", weatherRoutes);

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
