const express = require("express");
const router = express.Router();
const aidController = require("../../controllers/aidController/aidController");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");

// Only seeker can create aid
router.post(
    "/create",
    authMiddleware,
    roleMiddleware("seeker"),
    (req, res) => {
        res.json({ message: "Aid created successfully" });
    }
);

// Admin + Inventory Manager can update
router.put(
    "/update/:id",
    authMiddleware,
    roleMiddleware("admin", "inventory_manager"),
    (req, res) => {
        res.json({ message: "Aid updated successfully" });
    }
);

// Any logged-in user can view
router.get(
    "/",
    authMiddleware,
    (req, res) => {
        res.json({ message: "Aid list visible" });
    }
);

module.exports = router;

router.post("/", aidController.createAid);
router.get("/", aidController.getAllAids);
router.get("/:id", aidController.getAidById);
router.put("/:id/inventory-check", aidController.inventoryCheck);
router.put("/:id/admin-decision", aidController.adminDecision);
router.put("/:id/distribution", aidController.updateDistribution);

// Inventory manager: list pending inventory checks
router.get("/inventory/pending", aidController.getPendingInventory);

// Inventory manager: manually decrement stock after dispatch
router.put("/:id/inventory-decrement", aidController.inventoryDecrement);

// Admin: delete aid request
router.delete("/:id", aidController.deleteAid);

const Inventory = require("../../models/inventoryModel/Inventory");

router.post("/inventory", async (req, res) => {
    const item = await Inventory.create(req.body);
    res.json(item);
});

module.exports = router;

// Debug helper: list routes under this router
// Accessible at GET /api/aids/__routes
// (kept for debugging; remove in production)
router.get("/__routes", (req, res) => {
    try {
        const list = [];
        router.stack.forEach((layer) => {
            if (layer.route && layer.route.path) {
                const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
                list.push({ path: layer.route.path, methods });
            }
        });
        res.json(list);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});