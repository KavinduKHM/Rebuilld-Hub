require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const cors = require("cors");

connectDB();

const app = express();
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const authRoutes = require("./src/routes/authRoutes/authRoutes");
app.use("/api/auth", authRoutes);

// Log incoming requests (debug)
app.use((req, res, next) => {
  console.log('REQ', req.method, req.originalUrl);
  next();
});

// Routes
const aidRoutes = require("./src/routes/aidRoutes/aidRoutes");
app.use("/api/aids", aidRoutes);

const weatherRoutes = require("./src/routes/weatherRoutes/weatherRoutes");
app.use("/api/weather", weatherRoutes);

// Log registered routes (for debugging)
setTimeout(() => {
  const routes = [];
  try {
    if (!app._router || !Array.isArray(app._router.stack)) throw new Error('No router stack');
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
        routes.push(`${methods} ${middleware.route.path}`);
      } else if (middleware.name === 'router' && middleware.handle && Array.isArray(middleware.handle.stack)) {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
            // handler.route.path may be the sub-route; prefixing with middleware.regexp is complex — show as-is
            routes.push(`${methods} ${handler.route.path}`);
          }
        });
      }
    });
  } catch (e) {
    routes.push('Could not enumerate routes: ' + e.message);
  }
  console.log('Registered routes:\n', routes.join('\n'));
}, 500);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
const app = require("./src/app");
const mongoose = require("mongoose");


require("dotenv").config();

const PORT = process.env.PORT || 5000;



const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database Connection Failed:", error);
    process.exit(1);
  }
};

// Connect Database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
