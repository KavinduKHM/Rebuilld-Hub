const Donation = require("../../models/resourceModel/donationModel");
const inventoryService = require("./inventoryService");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Donation
exports.createDonation = async (data) => {
  // STOCK DONATION
  if (data.type === "STOCK") {
    await inventoryService.updateStockQuantity(data.inventoryId, data.quantity);
    return await Donation.create(data);
  }

  // MONEY DONATION
  if (data.type === "MONEY") {
    if (!data.amount) throw new Error("Amount is required");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount * 100, // cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    await inventoryService.updateMoneyAmount(data.inventoryId, data.amount);

    data.paymentStatus = "PENDING";

    const donation = await Donation.create(data);

    return {
      donation,
      clientSecret: paymentIntent.client_secret,
    };
  }
};

// Get all donations
exports.getAllDonations = async () => {
  return await Donation.find();
};

// Get donation by ID
exports.getDonationById = async (id) => {
  const donation = await Donation.findById(id);
  if (!donation) throw new Error("Donation not found");
  return donation;
};

// Delete donation by ID
exports.deleteDonation = async (id) => {
  const donation = await Donation.findByIdAndDelete(id);
  if (!donation) throw new Error("Donation not found");
  return donation;
};