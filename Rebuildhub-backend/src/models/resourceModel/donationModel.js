const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    donorNIC: { type: String, required: true },
    email: { type: String }, 
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