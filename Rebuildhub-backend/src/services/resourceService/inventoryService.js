const Inventory = require("../../models/resourceModel/InventoryModel");
const { v4: uuidv4 } = require("uuid");

const generateInventoryCode = async (type, category, name) => {
  const typePart = type === "MONEY" ? "MNY" : "STK";
  const categoryPart = category.substring(0, 4).toUpperCase();
  const namePart = name.substring(0, 4).toUpperCase();

  // Count existing similar items to create running number
  const count = await Inventory.countDocuments({
    type,
    category,
    name
  });

  const runningNumber = String(count + 1).padStart(3, "0");

  return `INV-${typePart}-${categoryPart}-${namePart}-${runningNumber}`;
};

exports.createInventory = async (data) => {
  data.inventoryCode = await generateInventoryCode(
    data.type,
    data.category,
    data.name
  );

  if (!data.totalQuantity) data.totalQuantity = 0;

  // Status logic
  if (data.type === "STOCK") {
    if (data.totalQuantity === 0) data.status = "Out of Stock";
    else if (data.totalQuantity < 10) data.status = "Low Stock";
    else data.status = "Available";
  }

  if (data.type === "MONEY") {
    if (data.totalQuantity === 0) data.status = "Out of Stock";
    else if (data.totalQuantity < 1000) data.status = "Low Stock";
    else data.status = "Available";
  }

  return await Inventory.create(data);
};

exports.getAllInventory = async () => {
  return await Inventory.find();
};

exports.getInventoryById = async (id) => {
  return await Inventory.findById(id);
};

exports.updateInventory = async (id, data) => {
  return await Inventory.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteInventory = async (id) => {
  return await Inventory.findByIdAndDelete(id);
};

// Update total quantity/status after donation or distribution
exports.updateQuantity = async (inventoryId, qtyChange) => {
  const inventory = await Inventory.findById(inventoryId);
  if (!inventory) throw new Error("Inventory not found");
  
  inventory.totalQuantity += qtyChange;
  
  // Update status
  if (inventory.type === "STOCK") {
    if (inventory.totalQuantity === 0) inventory.status = "Out of Stock";
    else if (inventory.totalQuantity < 10) inventory.status = "Low Stock";
    else inventory.status = "Available";
  }
  if (inventory.type === "MONEY") {
    if (inventory.totalQuantity === 0) inventory.status = "Out of Stock";
    else if (inventory.totalQuantity < 1000) inventory.status = "Low Stock";
    else inventory.status = "Available";
  }

  await inventory.save();
  return inventory;
};