const mongoose = require("mongoose");

// Inventory Schema
const inventorySchema = new mongoose.Schema({
    aidType: String,
    availableQuantity: Number
});

module.exports = mongoose.model("Inventory", inventorySchema);