const paymentService = require("../../services/paymentService/paymentService");

// Create Payment Intent
exports.donateMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await paymentService.createPaymentIntent(amount);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};