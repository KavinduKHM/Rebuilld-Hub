const donationService = require("../../services/resourceService/donationService");

exports.createDonation = async (req, res) => {
  try {
    const donation = await donationService.createDonation(req.body);
    res.status(201).json(donation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get donation by ID
exports.getDonationById = async (req, res) => {
  try {
    const donation = await donationService.getDonationById(req.params.id);
    res.status(200).json(donation);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Delete donation by ID
exports.deleteDonation = async (req, res) => {
  try {
    await donationService.deleteDonation(req.params.id);
    res.status(200).json({ message: "Donation deleted successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//get all donations
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await donationService.getAllDonations();
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};