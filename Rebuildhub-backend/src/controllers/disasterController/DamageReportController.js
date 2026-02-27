const damageService = require("../../services/disasterService/DamageReportService");
const uploadToCloudinary = require("../../utils/cloudinaryUpload");
const DamageReport = require("../../models/disasterModel/DamageReportModel");

exports.createReport = async (req, res) => {
  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadToCloudinary(file.buffer);
        imageUrls.push(imageUrl);
      }
    }

    const reportData = {
      ...req.body,
      images: imageUrls,
    };

    const report = await damageService.createDamageReport(reportData);

    res.status(201).json({
      success: true,
      message: "Damage report with images uploaded to cloud successfully",
      data: report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getReportsByDisaster = async (req, res) => {
  try {
    const { disasterId } = req.params;
    const reports = await damageService.getReportsByDisaster(disasterId);

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await damageService.verifyReport(id, status);

    res.status(200).json({
      success: true,
      message: "Damage report verification status updated",
      data: report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};