const mongoose = require("mongoose");

// Aid Schema
const aidSchema = new mongoose.Schema(
{
    // Linked damage report (from Disaster component)
    damageReportId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "DamageReport"
    },

    aidType: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    location: {
        lat: Number,
        lng: Number
    },

    // Status workflow
    inventoryStatus: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED", "DISPATCHED"],
        default: "PENDING"
    },

    adminStatus: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
    },

    distributionStatus: {
        type: String,
        enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
        default: "PENDING"
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("Aid", aidSchema);