const express = require("express");
const app = express();

app.use(express.json());

// Routes
const inventoryRoutes = require("./routes/resourceRoutes/inventoryRoute");
const donationRoutes = require("./routes/resourceRoutes/donationRoute");
const paymentRoutes = require("./routes/paymentRoutes/paymentRoute");

// Use routes
app.use("/Rebuildhub/inventory", inventoryRoutes);
app.use("/Rebuildhub/donations", donationRoutes);
app.use("/Rebuildhub/payment", paymentRoutes);

// Error handling middleware 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

module.exports = app;