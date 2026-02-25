const express = require("express");
const router = express.Router();
const controller = require("../../controllers/resourceController/donationController");
const { userOnly } = require("../../middlewares/authMiddleware");

router.post("/", userOnly, controller.createDonation);
router.get("/", controller.getAllDonations);

module.exports = router;