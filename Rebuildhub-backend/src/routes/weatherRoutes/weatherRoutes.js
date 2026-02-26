const express = require("express");
const router = express.Router();
const weatherController = require("../../controllers/weatherController/weatherController");
// Current weather
router.get("/", weatherController.getWeather);

//  5-day forecast
router.get("/forecast", weatherController.getForecast);

module.exports = router;