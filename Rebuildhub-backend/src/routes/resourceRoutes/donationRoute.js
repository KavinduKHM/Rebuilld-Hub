const express = require("express");
const router = express.Router();
const controller = require("../../controllers/resourceController/donationController");

// ============ HEALTH CHECK - MUST COME FIRST ============
router.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Donation route is working!" });
});

// ============ STRIPE ROUTES ============
router.post("/create-checkout-session", controller.createCheckoutSession);
router.get("/verify-payment", controller.verifyPayment);

// ============ QUERY ROUTES ============
router.get("/stats", controller.getDonationStats);
router.get("/donor/:donorNIC", controller.getDonationsByDonor);
router.get("/session/:sessionId", controller.getDonationBySessionId);

// ============ CRUD ROUTES (/:id MUST BE LAST) ============
router.post("/", controller.createDonation);
router.get("/", controller.getAllDonations);
router.get("/:id", controller.getDonationById);
router.patch("/:id", controller.updateDonationStatus);
router.delete("/:id", controller.deleteDonation);

module.exports = router;