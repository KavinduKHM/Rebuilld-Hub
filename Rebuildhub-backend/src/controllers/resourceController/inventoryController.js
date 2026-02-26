const inventoryService = require("../../services/resourceService/inventoryService");

exports.createInventory = async (req, res) => {
  try {
    const inv = await inventoryService.createInventory(req.body);
    res.status(201).json(inv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllInventory = async (req, res) => {
  try {
    const inv = await inventoryService.getAllInventory();
    res.status(200).json(inv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInventoryById = async (req, res) => {
  try {
    const inv = await inventoryService.getInventoryById(req.params.id);
    res.status(200).json(inv);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const inv = await inventoryService.updateInventory(
      req.params.id,
      req.body
    );
    res.status(200).json(inv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    await inventoryService.deleteInventory(req.params.id);
    res.status(200).json({ message: "Inventory deleted successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};