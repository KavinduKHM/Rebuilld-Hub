const donationService = require("../../services/resourceService/donationService");

exports.createDonation = async (req, res) => {
  try {
    const donation = await donationService.createDonation(req.body);
    res.status(201).json(donation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllDonations = async (req, res) => {
  try {
    const donations = await donationService.getAllDonations();
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};