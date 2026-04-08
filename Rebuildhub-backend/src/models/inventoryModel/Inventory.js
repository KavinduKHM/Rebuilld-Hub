const mongoose = require("mongoose");

// Inventory Schema for Aid module
const inventorySchema = new mongoose.Schema({
    aidType: String,
    availableQuantity: Number,
});

// Register as a distinct model name to avoid clashing with
// the resource Inventory model in src/models/resourceModel/InventoryModel.js
module.exports = mongoose.model("AidInventory", inventorySchema); 