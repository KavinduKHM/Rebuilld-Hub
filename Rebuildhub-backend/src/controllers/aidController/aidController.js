const Aid = require("../../models/aidModel/Aid");
const Inventory = require("../../models/inventoryModel/Inventory");

/*
CREATE AID REQUEST
User submits aid request
*/
exports.createAid = async (req, res) => {
    try {
        const { damageReportId, aidType, quantity, location } = req.body;

        const newAid = new Aid({
            damageReportId,
            aidType,
            quantity,
            location
        });

        await newAid.save();

        res.status(201).json(newAid);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/*
INVENTORY APPROVAL STEP
Check if enough stock is available
*/
exports.inventoryCheck = async (req, res) => {
    try {
        const aid = await Aid.findById(req.params.id);

        if (!aid) return res.status(404).json({ message: "Aid request not found" });

        const decision = req.body.decision; // expected: "APPROVED" or "REJECTED"

        if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
            return res.status(400).json({ message: "Provide decision in body: 'APPROVED' or 'REJECTED'" });
        }

        // If manager rejects, just mark rejected
        if (decision === "REJECTED") {
            aid.inventoryStatus = "REJECTED";
            await aid.save();
            return res.json(aid);
        }

        // If manager approves, just mark approved. Actual stock decrement
        // is performed manually by inventory manager via separate endpoint.
        aid.inventoryStatus = "APPROVED";
        await aid.save();

        res.json(aid);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// List aid requests that need inventory manager review
exports.getPendingInventory = async (req, res) => {
    try {
        const pending = await Aid.find({ inventoryStatus: "PENDING" });
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/*
ADMIN DECISION STEP
Admin approves only if inventory approved
*/
exports.adminDecision = async (req, res) => {
    try {
        const aid = await Aid.findById(req.params.id);

        if (aid.inventoryStatus !== "APPROVED") {
            return res.status(400).json({
                message: "Cannot approve. Inventory not approved."
            });
        }

        aid.adminStatus = req.body.decision;
        await aid.save();

        res.json(aid);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/*
UPDATE DISTRIBUTION STATUS
Track progress
*/
exports.updateDistribution = async (req, res) => {
    try {
        const aid = await Aid.findById(req.params.id);

        aid.distributionStatus = req.body.status;
        await aid.save();

        res.json(aid);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/*
GET ALL AID REQUESTS
*/
exports.getAllAids = async (req, res) => {
    try {
        const aids = await Aid.find();
        res.json(aids);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/*
GET AID BY ID
*/
exports.getAidById = async (req, res) => {
    try {
        const aid = await Aid.findById(req.params.id);
        if (!aid) return res.status(404).json({ message: "Aid request not found" });
        res.json(aid);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/*
GET SINGLE AID REQUEST
*/
exports.getAidById = async (req, res) => {
    try {
        const aid = await Aid.findById(req.params.id);
        if (!aid) {
            return res.status(404).json({ message: "Aid request not found" });
        }
        res.json(aid);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Manual stock decrement performed by inventory manager after physical dispatch
exports.inventoryDecrement = async (req, res) => {
    try {
        const aid = await Aid.findById(req.params.id);

        if (!aid) return res.status(404).json({ message: "Aid request not found" });

        if (aid.inventoryStatus !== "APPROVED") {
            return res.status(400).json({ message: "Aid must be APPROVED before decrementing stock" });
        }

        // Prefer an inventory document that has sufficient availableQuantity
        const inventory = await Inventory.findOne({ aidType: aid.aidType, availableQuantity: { $gte: aid.quantity } });

        if (!inventory) return res.status(400).json({ message: "Insufficient inventory to decrement" });

        inventory.availableQuantity -= aid.quantity;
        aid.inventoryStatus = "DISPATCHED";

        await inventory.save();
        await aid.save();

        res.json({ aid, inventory });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/*
DELETE AID REQUEST (Admin only)
*/
exports.deleteAid = async (req, res) => {
    try {
        const aid = await Aid.findById(req.params.id);

        if (!aid) {
            return res.status(404).json({ message: "Aid request not found" });
        }

        // Optional: Add admin check here if auth is implemented
        // For now, allow deletion

        await Aid.findByIdAndDelete(req.params.id);

        res.json({ message: "Aid request deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};