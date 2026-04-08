const express = require("express");
const router = express.Router();
const controller = require("../../controllers/resourceController/donationController");

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Donation route is working!" });
});

// Stripe routes - MUST come before /:id
router.post("/create-checkout-session", controller.createCheckoutSession);
router.get("/verify-payment", controller.verifyPayment);

// Special query routes
router.get("/stats", controller.getDonationStats);
router.get("/donor/:donorNIC", controller.getDonationsByDonor);
router.get("/session/:sessionId", controller.getDonationBySessionId);

// CRUD routes (/:id must be last)
router.post("/", controller.createDonation);
router.get("/", controller.getAllDonations);
router.get("/:id", controller.getDonationById);
router.patch("/:id", controller.updateDonationStatus);
router.delete("/:id", controller.deleteDonation);

module.exports = router;