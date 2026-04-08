const Donation = require("../../models/resourceModel/donationModel");
const inventoryService = require("./inventoryService");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Donation - Supports both STOCK and MONEY
exports.createDonation = async (data) => {
  // STOCK DONATION
  if (data.type === "STOCK") {
    await inventoryService.updateStockQuantity(data.inventoryId, data.quantity);
    const donation = await Donation.create(data);
    return { donation };
  }

  // MONEY DONATION - This is for direct API calls
  if (data.type === "MONEY") {
    const donation = await Donation.create(data);
    return { donation };
  }
};

// Get all donations
exports.getAllDonations = async () => {
  return await Donation.find().sort({ createdAt: -1 });
};

// Get donation by ID
exports.getDonationById = async (id) => {
  const donation = await Donation.findById(id);
  if (!donation) throw new Error("Donation not found");
  return donation;
};

// Get donation by Stripe session ID
exports.getDonationBySessionId = async (sessionId) => {
  const donation = await Donation.findOne({ stripeSessionId: sessionId });
  if (!donation) throw new Error("Donation not found");
  return donation;
};

// Update donation status
exports.updateDonationStatus = async (id, data) => {
  const donation = await Donation.findByIdAndUpdate(id, data, { new: true });
  if (!donation) throw new Error("Donation not found");
  return donation;
};

// Delete donation by ID
exports.deleteDonation = async (id) => {
  const donation = await Donation.findByIdAndDelete(id);
  if (!donation) throw new Error("Donation not found");
  return donation;
};

// Get donations by donor NIC
exports.getDonationsByDonor = async (donorNIC) => {
  return await Donation.find({ donorNIC }).sort({ createdAt: -1 });
};

// Get donation statistics
exports.getDonationStats = async () => {
  const totalDonations = await Donation.countDocuments();
  const successfulDonations = await Donation.countDocuments({ paymentStatus: 'SUCCESS' });
  const pendingDonations = await Donation.countDocuments({ paymentStatus: 'PENDING' });
  
  const totalAmount = await Donation.aggregate([
    { $match: { paymentStatus: 'SUCCESS', type: 'MONEY' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const totalStockItems = await Donation.aggregate([
    { $match: { paymentStatus: 'SUCCESS', type: 'STOCK' } },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);
  
  return {
    totalDonations,
    successfulDonations,
    pendingDonations,
    totalMoneyAmount: totalAmount[0]?.total || 0,
    totalStockQuantity: totalStockItems[0]?.total || 0,
  };
};