const Aid = require("../../models/aidModel/Aid");
const Inventory = require("../../models/resourceModel/inventoryModel");

const updateInventoryStatus = (inventory) => {
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

const normalizeCategory = (value) => (value ?? "").toString().trim().toUpperCase();

const categoryAliases = {
    FOOD: ["FOOD"],
    CLOTH: ["CLOTH"],
    SANITORY: ["SANITORY", "SANITARY"],
    SANITARY: ["SANITORY", "SANITARY"],
};

const consumeInventoryForAid = async (aid) => {
    const requestedAmount = Number(aid.quantity);
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
        throw new Error("Invalid aid quantity");
    }

    const isMoneyAid = aid.aidType === "Money";
    let inventories = [];
    if (isMoneyAid) {
        inventories = await Inventory.find({ type: "MONEY" }).sort({ createdAt: 1 });
    } else {
        const aliases = categoryAliases[normalizeCategory(aid.aidType)] || [normalizeCategory(aid.aidType)];
        const stockInventories = await Inventory.find({ type: "STOCK" }).sort({ createdAt: 1 });
        inventories = stockInventories.filter((item) => aliases.includes(normalizeCategory(item.category)));
    }

    if (!inventories.length) {
        throw new Error(isMoneyAid ? "No money inventory available" : `No inventory found for ${aid.aidType}`);
    }

    const totalAvailable = inventories.reduce((sum, item) => {
        return sum + (isMoneyAid ? Number(item.totalAmount || 0) : Number(item.totalQuantity || 0));
    }, 0);

    if (totalAvailable < requestedAmount) {
        throw new Error(
            isMoneyAid
                ? `Insufficient money inventory. Available: ${totalAvailable}, Requested: ${requestedAmount}`
                : `Insufficient ${aid.aidType} inventory. Available: ${totalAvailable}, Requested: ${requestedAmount}`
        );
    }

    let remaining = requestedAmount;

    for (const inventory of inventories) {
        if (remaining <= 0) break;

        const currentValue = isMoneyAid
            ? Number(inventory.totalAmount || 0)
            : Number(inventory.totalQuantity || 0);
        if (currentValue <= 0) continue;

        const toConsume = Math.min(currentValue, remaining);

        if (isMoneyAid) {
            inventory.totalAmount = currentValue - toConsume;
        } else {
            inventory.totalQuantity = currentValue - toConsume;
        }

        updateInventoryStatus(inventory);
        await inventory.save();

        remaining -= toConsume;
    }
};

/*
CREATE AID REQUEST
User submits aid request
*/
exports.createAid = async (req, res) => {
    try {
        const { damageReportId, aidType, quantity, location } = req.body;

        const numericQuantity = Number(quantity);
        const quantityUnit = aidType === "Money" ? "RUPEES" : "PEOPLE";

        const newAid = new Aid({
            damageReportId,
            aidType,
            quantity: numericQuantity,
            quantityUnit,
            location
        });

        await newAid.save();

        res.status(201).json(newAid);

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};


/*
ADMIN DECISION STEP
Admin approves or rejects aid request
*/
exports.adminDecision = async (req, res) => {
    try {
        const aid = await Aid.findById(req.params.id);

        if (!aid) {
            return res.status(404).json({ message: "Aid request not found" });
        }

        const decision = req.body.decision;
        if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
            return res.status(400).json({ message: "Provide decision in body: 'APPROVED' or 'REJECTED'" });
        }

        if (decision === "APPROVED" && !aid.inventoryDeducted) {
            await consumeInventoryForAid(aid);
            aid.inventoryDeducted = true;
        }

        aid.adminStatus = decision;
        await aid.save();

        res.json(aid);

    } catch (error) {
        const statusCode = /Insufficient|No inventory|Invalid aid quantity/i.test(error.message) ? 400 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};


/*
UPDATE DISTRIBUTION STATUS
Track progress
*/
exports.updateDistribution = async (req, res) => {
    try {
        const aid = await Aid.findById(req.params.id);

        if (!aid) {
            return res.status(404).json({ message: "Aid request not found" });
        }

        const { status } = req.body;
        if (!status || !["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)) {
            return res.status(400).json({ message: "Provide status in body: 'PENDING', 'IN_PROGRESS', or 'COMPLETED'" });
        }

        aid.distributionStatus = status;
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