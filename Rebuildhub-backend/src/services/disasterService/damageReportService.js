const DamageReport = require("../models/DamageReport");

const createDamageReport = async (data) => {
  if (!data.damageDescription) {
    throw new Error("Damage description is required");
  }

  const report = await DamageReport.create(data);
  return report;
};

const getReportsByDisaster = async (disasterId) => {
  return await DamageReport.find({ disasterId }).populate("disasterId");
};

const verifyReport = async (reportId, status) => {
  const report = await DamageReport.findById(reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  report.verificationStatus = status;
  return await report.save();
};

module.exports = {
  createDamageReport,
  getReportsByDisaster,
  verifyReport,
};