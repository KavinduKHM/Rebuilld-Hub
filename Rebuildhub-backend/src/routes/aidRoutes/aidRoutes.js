const express = require("express");
const router = express.Router();
const aidController = require("../../controllers/aidController/aidController");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");

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

// Admin: delete aid request
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    aidController.deleteAid
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