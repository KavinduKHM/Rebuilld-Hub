const express = require("express");
const app = express();

app.use(express.json());

// Routes
const inventoryRoutes = require("./routes/resourceRoutes/inventoryRoute");
const donationRoutes = require("./routes/resourceRoutes/donationRoute");

app.use("/api/inventory", inventoryRoutes);
app.use("/api/donations", donationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

module.exports = app;