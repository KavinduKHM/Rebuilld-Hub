const Donation = require('../../models/resourceModel/donationModel');
const inventoryService = require("./inventoryService");

exports.createDonation = async (data) => {
  // Update inventory totalQuantity
  await inventoryService.updateQuantity(data.inventoryId, data.quantity);
  return await Donation.create(data);
};

exports.getAllDonations = async () => {
  return await Donation.find().populate("inventoryId").populate("userId");
};