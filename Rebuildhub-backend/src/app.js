const express = require("express");
const cors = require("cors");

const disasterRoutes = require("./routes/disasterRoutes/DisasterRoutes");
const damageReportRoutes = require("./routes/disasterRoutes/DamageReportRoutes");
const nasaRoutes = require("./routes/disasterRoutes/nasaRoutes");
const authRoutes = require("./routes/authRoutes/authRoutes");
const aidRoutes = require("./routes/aidRoutes/aidRoutes");
const weatherRoutes = require("./routes/weatherRoutes/weatherRoutes");



const app = express();

// app.use(cors());
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


// Routes
app.use("/api/disasters", disasterRoutes);
app.use("/api/reports", damageReportRoutes);
app.use("/api/external", nasaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/aids", aidRoutes);
app.use("/api/weather", weatherRoutes);

// Log incoming requests (debug)
app.use((req, res, next) => {
  console.log('REQ', req.method, req.originalUrl);
  next();
});




module.exports = app;