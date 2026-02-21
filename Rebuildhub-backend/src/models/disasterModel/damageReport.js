const mongoose = require("mongoose");

const damageReportSchema = new mongoose.Schema(
  {
    disasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disaster",
      required: true,
    },
    reporterName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    damageType: {
      type: String,
      enum: ["Infrastructure", "Housing", "Medical", "Agriculture", "Other"],
      required: true,
    },
    damageDescription: {
      type: String,
      required: true,
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    images: [String],
    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    estimatedLoss: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DamageReport", damageReportSchema);