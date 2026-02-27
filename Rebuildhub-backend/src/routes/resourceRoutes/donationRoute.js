const express = require("express");
const router = express.Router();
const controller = require("../../controllers/resourceController/donationController");
const { userOnly } = require("../../middlewares/authMiddleware");

router.post("/",controller.createDonation);
router.get("/", controller.getAllDonations);

// Get donation by ID
router.get("/:id", controller.getDonationById);

// Delete donation by ID
router.delete("/:id", controller.deleteDonation);

module.exports = router;