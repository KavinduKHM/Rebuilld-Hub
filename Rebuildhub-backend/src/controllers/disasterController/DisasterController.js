const Disaster = require("../../models/disasterModel/DisasterModel");
const { uploadToCloudinary } = require("../../services/disasterService/cloudinaryService");
const DamageReport = require("../../models/disasterModel/DamageReportModel");

const getSuggestedVolunteerCount = (severityLevel) => {
  switch (severityLevel) {
    case "Low":
      return 5;
    case "Medium":
      return 15;
    case "High":
      return 30;
    case "Critical":
      return 50;
    default:
      return 10;
  }
};

exports.createDisaster = async (req, res) => {
  try {
    let imageUrls = [];

    // Upload disaster evidence images to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadToCloudinary(file.buffer);
        imageUrls.push(imageUrl);
      }
    }

    // Create Disaster with images
    const disaster = await Disaster.create({
      ...req.body,
      images: imageUrls,
      createdBy: req.user?.id || null,
    });

    // AUTO GENERATE DAMAGE REPORT (CORE REQUIREMENT)
    const autoDamageReport = await DamageReport.create({
      disasterId: disaster._id, // Must match ObjectId
      reporterName: "System Auto Generated",
      contactNumber: "N/A",
      damageType: "Infrastructure",
      damageDescription: `Auto-generated damage assessment for ${disaster.title} based on uploaded disaster evidence and severity level.`,
      location: disaster.location,
      images: imageUrls, // Same images as verification proof
      verificationStatus: "Verified",
      estimatedLoss: estimateLoss(disaster.severityLevel),
    });

    res.status(201).json({
      success: true,
      message: "Disaster created and damage report auto-generated successfully",
      disaster,
      autoDamageReport,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllDisasters = async (req, res) => {
  try {
    const disasters = await Disaster.find().sort({ createdAt: -1 });
    res.status(200).json(disasters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSingleDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id);

    if (!disaster) {
      return res.status(404).json({ message: "Disaster not found" });
    }

    res.status(200).json(disaster);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(disaster);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDisaster = async (req, res) => {
  try {
    await Disaster.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Disaster deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Smart loss estimation (for marking criteria - business logic)
const estimateLoss = (severity) => {
  switch (severity) {
    case "Low":
      return 10000;
    case "Medium":
      return 50000;
    case "High":
      return 200000;
    case "Critical":
      return 1000000;
    default:
      return 0;
  }
};