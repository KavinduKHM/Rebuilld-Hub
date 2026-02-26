const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
exports.createPaymentIntent = async (amount) => {
  if (!amount || amount <= 0) throw new Error("Invalid donation amount");

  // Stripe expects amount in cents
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "usd",
    payment_method_types: ["card"],
  });

  return paymentIntent;
};