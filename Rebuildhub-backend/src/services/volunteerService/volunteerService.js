const Volunteer = require("../../models/volunteerModel/volunteerModel");

const registerVolunteer = async (data) => {
  const { name, phone, district, skills } = data;

  // Check if phone already exists
  const existing = await Volunteer.findOne({ phone });
  if (existing) {
    throw new Error("Phone number already registered");
  }

  const volunteer = await Volunteer.create({
    name,
    phone,
    district,
    skills,
  });

  return volunteer;
};

const getAllVolunteers = async () => {
  return await Volunteer.find().sort({ createdAt: -1 });
};

const getVolunteerById = async (id) => {
  // Check if it's MongoDB ObjectId or custom volunteerId
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // It's a MongoDB ObjectId
    return await Volunteer.findById(id);
  } else {
    // It might be the custom volunteerId (number)
    return await Volunteer.findOne({ volunteerId: parseInt(id) });
  }
};

const updateVolunteer = async (id, data) => {
  // Check if it's MongoDB ObjectId
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    return await Volunteer.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  } else {
    // It might be the custom volunteerId
    return await Volunteer.findOneAndUpdate(
      { volunteerId: parseInt(id) },
      data,
      { new: true, runValidators: true },
    );
  }
};

const deleteVolunteer = async (id) => {
  // Check if it's MongoDB ObjectId
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    return await Volunteer.findByIdAndDelete(id);
  } else {
    // It might be the custom volunteerId
    return await Volunteer.findOneAndDelete({ volunteerId: parseInt(id) });
  }
};

module.exports = {
  registerVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
};
