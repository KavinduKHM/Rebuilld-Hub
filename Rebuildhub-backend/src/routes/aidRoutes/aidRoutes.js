const express = require("express");
const router = express.Router();
const aidController = require("../../controllers/aidController/aidController");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const Inventory = require("../../models/inventoryModel/Inventory");

// Create aid: allowed for seeker, inventory_manager, admin
router.post(
    "/",
    authMiddleware,
    roleMiddleware("seeker", "inventory_manager", "admin"),
    aidController.createAid
);

// Get all aids: any authenticated user
router.get(
    "/",
    authMiddleware,
    aidController.getAllAids
);

// Get specific aid by ID: any authenticated user (admin can also access)
router.get(
    "/:id",
    authMiddleware,
    aidController.getAidById
);

// Inventory manager: list pending inventory checks (inventory_manager + admin can view)
router.get(
    "/inventory/pending",
    authMiddleware,
    roleMiddleware("inventory_manager", "admin"),
    aidController.getPendingInventory
);

// Inventory check: only inventory_manager (admin may be permitted if desired)
router.put(
    "/:id/inventory-check",
    authMiddleware,
    roleMiddleware("inventory_manager"),
    aidController.inventoryCheck
);

// Admin decision: only admin
router.put(
    "/:id/admin-decision",
    authMiddleware,
    roleMiddleware("admin"),
    aidController.adminDecision
);

// Update distribution status: only admin
router.put(
    "/:id/distribution",
    authMiddleware,
    roleMiddleware("admin"),
    aidController.updateDistribution
);

// Inventory manager: manually decrement stock after dispatch
router.put(
    "/:id/inventory-decrement",
    authMiddleware,
    roleMiddleware("inventory_manager", "admin"),
    aidController.inventoryDecrement
);

// Admin: delete aid request
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    aidController.deleteAid
);

// Create inventory (inventory manager or admin)
router.post(
    "/inventory",
    authMiddleware,
    roleMiddleware("inventory_manager", "admin"),
    async (req, res) => {
        try {
            const item = await Inventory.create(req.body);
            res.json(item);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// Debug helper: list routes under this router (kept for debugging)
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

module.exports = router;