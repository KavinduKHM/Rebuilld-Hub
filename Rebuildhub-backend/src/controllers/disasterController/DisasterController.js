const Disaster = require("../../models/disasterModel/DisasterModel");

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
    const body = { ...req.body };

    // Auto-suggest volunteer count if not provided, based on severity level
    if (!body.suggestedVolunteerCount) {
      body.suggestedVolunteerCount = getSuggestedVolunteerCount(
        body.severityLevel || "Medium"
      );
    }

    const disaster = await Disaster.create({
      ...body,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      data: disaster,
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