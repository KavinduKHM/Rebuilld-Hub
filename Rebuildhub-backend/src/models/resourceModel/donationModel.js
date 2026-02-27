const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    donorNIC: { type: String, required: true },
    email: { type: String },

    inventoryId: {
  type: String,
  required: true,
  ref: "Inventory"
  },

    type: { type: String, enum: ["MONEY", "STOCK"], required: true },

    name: { type: String, required: true },
    description: { type: String },

    // STOCK ONLY
    quantity: {
      type: Number,
      required: function () {
        return this.type === "STOCK";
      },
    },

    unit: {
      type: String,
      required: function () {
        return this.type === "STOCK";
      },
    },

    // MONEY ONLY
    amount: {
      type: Number,
      required: function () {
        return this.type === "MONEY";
      },
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);