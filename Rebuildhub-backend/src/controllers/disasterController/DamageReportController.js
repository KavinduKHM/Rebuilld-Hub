const damageService = require("../../services/disasterService/damageReportService");

exports.createReport = async (req, res) => {
  try {
    const report = await damageService.createDamageReport(req.body);
    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getReportsByDisaster = async (req, res) => {
  try {
    const reports = await damageService.getReportsByDisaster(
      req.params.disasterId
    );
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyReport = async (req, res) => {
  try {
    const report = await damageService.verifyReport(
      req.params.id,
      req.body.status
    );
    res.status(200).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};