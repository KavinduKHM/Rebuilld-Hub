const express = require("express");
const cors = require("cors");

const disasterRoutes = require("./routes/disaster.routes");
const damageReportRoutes = require("./routes/damageReport.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/disasters", disasterRoutes);
app.use("/api/reports", damageReportRoutes);

module.exports = app;