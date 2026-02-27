const express = require("express");
const router = express.Router();
const controller = require("../../controllers/resourceController/inventoryController");
const { adminOnly } = require("../../middlewares/authMiddleware");

router.post("/", adminOnly, controller.createInventory);
router.get("/", controller.getAllInventory);
router.get("/:id", controller.getInventoryById);
router.put("/:id", adminOnly, controller.updateInventory);
router.delete("/:id", adminOnly, controller.deleteInventory);

module.exports = router;