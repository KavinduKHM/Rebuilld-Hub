const mongoose = require("mongoose");

const disasterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Disaster title is required"],
    },
    type: {
      type: String,
      enum: ["Flood", "Earthquake", "Landslide", "Cyclone", "Other"],
      required: true,
    },
    location: {
      name: String,
      latitude: Number,
      longitude: Number,
    },
    description: {
      type: String,
      required: true,
    },
    severityLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critica"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Active", "Under Assessment", "Resolved"],
      default: "Active",
    },
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disaster", disasterSchema);