import mongoose from "mongoose";

// Counter schema for auto-increment
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

const volunteerSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one skill is required",
      },
    },
    availability: {
      type: String,
      enum: ["AVAILABLE", "UNAVAILABLE"],
      default: "UNAVAILABLE",
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

// Auto-increment volunteerId before save
volunteerSchema.pre("save", async function (next) {
  if (this.volunteerId) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "volunteerId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.volunteerId = counter.seq;
    next();
  } catch (error) {
    next(error);
  }
});

const Volunteer = mongoose.model("Volunteer", volunteerSchema);
export default Volunteer;
