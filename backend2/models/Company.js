const mongoose = require("mongoose");
const { complianceDb } = require("../config/db");

const CompanySchema = new mongoose.Schema(
    {
        tier: {
            type: String,
            required: true,
            enum: ["Tier 1", "Tier 2", "Tier 3"]
        },
        companyData: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        status: {
            type: String,
            enum: ["registered", "active", "inactive"],
            default: "registered"
        }
    },
    { timestamps: true }
);

module.exports = complianceDb.model("Company", CompanySchema);