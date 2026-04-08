const Aid = require("../../models/aidModel/Aid");

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

        aid.adminStatus = decision;
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