const Inventory = require("../../models/resourceModel/InventoryModel");

// -----------------------------
// Generate Inventory Code
// -----------------------------
const generateInventoryCode = async (type, category, name) => {
  const typePart = type === "MONEY" ? "MNY" : "STK";
   const categoryPart = type === "STOCK" ? category.substring(0, 4).toUpperCase() : "NONE";
  const namePart = name.substring(0, 4).toUpperCase();

  const count = await Inventory.countDocuments({ type, category, name });
  const runningNumber = String(count + 1).padStart(3, "0");

  return `INV-${typePart}-${categoryPart}-${namePart}-${runningNumber}`;
};

// -----------------------------
// Status Logic
// -----------------------------
const updateStatus = (inventory) => {
  if (inventory.type === "STOCK") {
    if (inventory.totalQuantity === 0) inventory.status = "Out of Stock";
    else if (inventory.totalQuantity < 10) inventory.status = "Low Stock";
    else inventory.status = "Available";
  }

  if (inventory.type === "MONEY") {
    if (inventory.totalAmount === 0) inventory.status = "Not available";
    else if (inventory.totalAmount < 1000) inventory.status = "Low Amount";
    else inventory.status = "Available";
  }
};

// -----------------------------
// CREATE
// -----------------------------
exports.createInventory = async (data) => {
  data.inventoryCode = await generateInventoryCode(
    data.type,
    data.category,
    data.name
  );

  if (data.type === "STOCK") data.totalQuantity = data.totalQuantity || 0;
  if (data.type === "MONEY") data.totalAmount = data.totalAmount || 0;

  const inventory = new Inventory(data);
  updateStatus(inventory);

  await inventory.save();

  return cleanInventoryResponse(inventory); // return cleaned response
};


// -----------------------------
// GET ALL
// -----------------------------
exports.getAllInventory = async () => {
  const inventories = await Inventory.find();
  return inventories.map(cleanInventoryResponse);
};

// -----------------------------
// GET BY ID
// -----------------------------
exports.getInventoryById = async (id) => {
  const inventory = await Inventory.findById(id);
  if (!inventory) throw new Error("Inventory not found");
  return cleanInventoryResponse(inventory);
};

// -----------------------------
// UPDATE (Allow all except inventoryCode)
// -----------------------------
exports.updateInventory = async (id, data) => {
  const inventory = await Inventory.findById(id);
  if (!inventory) throw new Error("Inventory not found");

  // Prevent inventoryCode modification
  delete data.inventoryCode;

  Object.keys(data).forEach((key) => {
    inventory[key] = data[key];
  });

  updateStatus(inventory);

  return await inventory.save();
};

// -----------------------------
// DELETE
// -----------------------------
exports.deleteInventory = async (id) => {
  const inventory = await Inventory.findById(id);
  if (!inventory) throw new Error("Inventory not found");

  await Inventory.findByIdAndDelete(id);
};

// -----------------------------
// INCREASE / DECREASE STOCK
// -----------------------------
exports.updateStockQuantity = async (inventoryId, qtyChange) => {
  const inventory = await Inventory.findById(inventoryId);
  if (!inventory) throw new Error("Inventory not found");

  if (inventory.type !== "STOCK")
    throw new Error("Not a stock inventory item");

  const newQty = inventory.totalQuantity + qtyChange;

  if (newQty < 0)
    throw new Error("Insufficient stock quantity");

  inventory.totalQuantity = newQty;

  updateStatus(inventory);

  return await inventory.save();
};

// -----------------------------
// INCREASE / DECREASE MONEY
// -----------------------------
exports.updateMoneyAmount = async (inventoryId, amountChange) => {
  const inventory = await Inventory.findById(inventoryId);
  if (!inventory) throw new Error("Inventory not found");

  if (inventory.type !== "MONEY")
    throw new Error("Not a money inventory item");

  const newAmount = inventory.totalAmount + amountChange;

  if (newAmount < 0)
    throw new Error("Insufficient funds");

  inventory.totalAmount = newAmount;

  updateStatus(inventory);

  return await inventory.save();
};

// Utility to clean inventory response
const cleanInventoryResponse = (inventory) => {
  const obj = inventory.toObject(); // convert Mongoose doc to plain object
  if (obj.type === "MONEY") {
    delete obj.totalQuantity;
    delete obj.unit;
    delete obj.category;
  } else if (obj.type === "STOCK") {
    delete obj.totalAmount;
  }
  return obj;
};

