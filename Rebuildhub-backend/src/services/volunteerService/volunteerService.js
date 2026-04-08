const Volunteer = require("../../models/volunteerModel/volunteerModel");
const User = require("../../models/userModel/User");
const bcrypt = require("bcryptjs");

const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test((value || "").toString());

const toVolunteerNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && String(parsed) === value.toString() ? parsed : null;
};

const registerVolunteer = async (data) => {
  const { name, email, password, phone, district, skills } = data;
  const normalizedEmail = email.toLowerCase();

  // Check if phone already exists
  const existing = await Volunteer.findOne({ phone });
  if (existing) {
    throw new Error("Phone number already registered");
  }

  // Check if email already exists in either volunteer or user records
  const existingEmail = await Volunteer.findOne({ email: normalizedEmail });
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingEmail || existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: "volunteer",
  });

  try {
    const volunteer = await Volunteer.create({
      name,
      email: normalizedEmail,
      phone,
      district,
      skills,
    });

    return volunteer;
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
};

const getAllVolunteers = async () => {
  return await Volunteer.find().sort({ createdAt: -1 });
};

const getVolunteerById = async (id) => {
  if (isObjectId(id)) {
    // It's a MongoDB ObjectId
    return await Volunteer.findById(id);
  }

  const volunteerId = toVolunteerNumber(id);
  if (volunteerId === null) {
    throw new Error("Invalid volunteer identifier");
  }

  return await Volunteer.findOne({ volunteerId });
};

const updateVolunteer = async (id, data) => {
  if (isObjectId(id)) {
    return await Volunteer.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  const volunteerId = toVolunteerNumber(id);
  if (volunteerId === null) {
    throw new Error("Invalid volunteer identifier");
  }

  return await Volunteer.findOneAndUpdate(
    { volunteerId },
    data,
    { new: true, runValidators: true },
  );
};

const deleteVolunteer = async (id) => {
  if (isObjectId(id)) {
    return await Volunteer.findByIdAndDelete(id);
  }

  const volunteerId = toVolunteerNumber(id);
  if (volunteerId === null) {
    throw new Error("Invalid volunteer identifier");
  }

  return await Volunteer.findOneAndDelete({ volunteerId });
};

module.exports = {
  registerVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
};
