const mongoose = require("mongoose");

const ALLOWED_AID_TYPES = ["Food", "Cloth", "Sanitory", "Money"];

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
        enum: ALLOWED_AID_TYPES,
        required: true,
        trim: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    quantityUnit: {
        type: String,
        enum: ["PEOPLE", "RUPEES"],
        default: function () {
            return this.aidType === "Money" ? "RUPEES" : "PEOPLE";
        }
    },

    location: {
        country: {
            type: String,
            required: true,
            trim: true
        },
        province: {
            type: String,
            required: true,
            trim: true
        },
        district: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        }
    },

    // Status workflow
    adminStatus: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
    },

    distributionStatus: {
        type: String,
        enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
        default: "PENDING"
    },

    inventoryDeducted: {
        type: Boolean,
        default: false
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("Aid", aidSchema);