const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true },
    type: { type: String, enum: ["MONEY", "STOCK"], required: true },
    category: { type: String, enum: ["Food", "Cloth", "Sanitory"], required: true },
    name: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, default: 0 },
    unit: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);