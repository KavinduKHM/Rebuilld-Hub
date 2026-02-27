const express = require("express");
const cors = require("cors");
const app = express();


// Routes
const disasterRoutes = require("./routes/disasterRoutes/DisasterRoutes");
const damageReportRoutes = require("./routes/disasterRoutes/DamageReportRoutes");
const authRoutes = require("./routes/authRoutes/authRoutes");
const aidRoutes = require("./routes/aidRoutes/aidRoutes");
const weatherRoutes = require("./routes/weatherRoutes/weatherRoutes");
const inventoryRoutes = require("./routes/resourceRoutes/inventoryRoute");
const donationRoutes = require("./routes/resourceRoutes/donationRoute");
const paymentRoutes = require("./routes/paymentRoutes/paymentRoute");
const volunteerRoutes = require("./routes/volunteerRoutes/volunteerRoutes.js");
const eventRoutes = require("./routes/eventRoutes/eventRoutes.js");


// app.use(cors());
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());

// Use routes
app.use("/api/disasters", disasterRoutes);
app.use("/api/reports", damageReportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/aids", aidRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/Rebuildhub/inventory", inventoryRoutes);
app.use("/Rebuildhub/donations", donationRoutes);
app.use("/Rebuildhub/payment", paymentRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/events", eventRoutes);

// Error handling middleware 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

module.exports = app;
