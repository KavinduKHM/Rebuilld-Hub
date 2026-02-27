const express = require("express");
const router = express.Router();
const nasaController = require("../../controllers/disasterController/nasaDisasterController");

router.get("/nasa-disasters", nasaController.getNASADisasters);

module.exports = router;