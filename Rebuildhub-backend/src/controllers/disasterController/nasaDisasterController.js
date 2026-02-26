const nasaService = require("../../services/disasterService/nasaEonetService");

exports.getNASADisasters = async (req, res) => {
  try {
    const disasters = await nasaService.getSriLankaDisastersFromNASA();

    res.status(200).json({
      success: true,
      country: "Sri Lanka",
      totalEvents: disasters.length,
      data: disasters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};