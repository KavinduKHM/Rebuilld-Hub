const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/paymentController/paymentController");

router.post("/donate", paymentController.donateMoney);

module.exports = router;