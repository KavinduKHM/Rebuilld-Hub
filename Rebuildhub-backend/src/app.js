const express = require("express");
const cors = require("cors");


const disasterRoutes = require("./routes/disasterRoutes/DisasterRoutes");
const damageReportRoutes = require("./routes/disasterRoutes/damageReportRoutes");
const nasaRoutes = require("./routes/disasterRoutes/nasaRoutes");

const app = express();

app.use(cors());
app.use(express.json());


// Routes
app.use("/api/disasters", disasterRoutes);
app.use("/api/reports", damageReportRoutes);
app.use("/api/external", nasaRoutes);

module.exports = app;