import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import volunteerRoutes from "./routes/volunteerRoutes/volunteerRoutes.js";

// Load env
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (optional - remove if you don't need it)
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url}`);
  next();
});

// Mount volunteer routes
if (volunteerRoutes) {
  app.use("/api/volunteers", volunteerRoutes);
  console.log("✅ Volunteer routes mounted at /api/volunteers");
}

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "API is running...",
    version: "1.0.0",
    endpoints: {
      volunteers: "GET /api/volunteers",
      register: "POST /api/volunteers/register",
      volunteerById: "GET /api/volunteers/:id",
      updateVolunteer: "PUT /api/volunteers/:id",
      deleteVolunteer: "DELETE /api/volunteers/:id",
      test: "GET /api/volunteers/test",
      debug: "GET /api/volunteers/debug",
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
    message: "Something went wrong!",
  });
});

export default app;
