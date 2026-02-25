const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    inventoryCode: { type: String, unique: true },
    type: { type: String, enum: ["MONEY", "STOCK"], required: true },
    category: { type: String, enum: ["Food", "Cloth", "Sanitory"], required: true },
    name: { type: String, required: true },
    description: { type: String },
    totalQuantity: { type: Number, default: 0 },
    unit: { type: String },
    status: { type: String, enum: ["Available", "Low Stock", "Out of Stock"], default: "Available" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);