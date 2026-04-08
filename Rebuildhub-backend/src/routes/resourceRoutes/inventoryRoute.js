const express = require("express");
const router = express.Router();
const controller = require("../../controllers/resourceController/inventoryController");
const authMiddleware = require("../../middlewares/authMiddleware");
const { adminOnly } = require("../../middlewares/authMiddleware");

router.post("/", authMiddleware, adminOnly, controller.createInventory);
router.get("/", controller.getAllInventory);
router.get("/:id", controller.getInventoryById);
router.put("/:id", authMiddleware, adminOnly, controller.updateInventory);
router.delete("/:id", authMiddleware, adminOnly, controller.deleteInventory);

module.exports = router;