const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    inventoryCode: { type: String, unique: true },

    type: { type: String, enum: ["MONEY", "STOCK"], required: true },

    category: {
  type: String,
  enum: ["Food", "Cloth", "Sanitory"],
  required: function () {
    return this.type === "STOCK"; // Only required for STOCK
  },
},
unit: {
  type: String,
  required: function () {
    return this.type === "STOCK"; // Only required for STOCK
  },
},
    name: { type: String, required: true },

    description: { type: String },

    // STOCK only
    totalQuantity: { type: Number, default: 0 },

    // MONEY only
    totalAmount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["Available", "Low Stock", "Out of Stock"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);