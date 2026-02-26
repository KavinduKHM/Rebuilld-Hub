const express = require("express");
const router = express.Router();
const controller = require("../../controllers/paymentController/paymentController");

router.post("/", controller.createPaymentIntent);

module.exports = router;
