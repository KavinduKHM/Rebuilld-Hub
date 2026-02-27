import volunteerService from "../../services/volunteerService/volunteerService.js";

// Register volunteer
const registerVolunteer = async (req, res) => {
  try {
    const volunteer = await volunteerService.registerVolunteer(req.body);
    res.status(201).json({
      message: "Volunteer registered successfully. Pending verification.",
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// Get all volunteers
const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await volunteerService.getAllVolunteers();
    res.status(200).json({
      success: true,
      count: volunteers.length,
      data: volunteers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get volunteer by ID
const getVolunteerById = async (req, res) => {
  try {
    const volunteer = await volunteerService.getVolunteerById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }
    res.status(200).json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update volunteer
const updateVolunteer = async (req, res) => {
  try {
    const volunteer = await volunteerService.updateVolunteer(
      req.params.id,
      req.body,
    );
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Volunteer updated successfully",
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete volunteer
const deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await volunteerService.deleteVolunteer(req.params.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Volunteer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  registerVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
};
