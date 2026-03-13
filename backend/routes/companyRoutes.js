const express = require("express");
const Company = require("../models/Company");

const router = express.Router();

// Create company from registration form
router.post("/register", async (req, res) => {
    try {
        const { tier, formData } = req.body;

        if (!tier || !formData) {
            return res.status(400).json({ success: false, message: "tier and formData are required" });
        }

        const company = await Company.create({
            tier,
            companyData: formData
        });

        res.status(201).json({
            success: true,
            message: "Company registered successfully",
            data: company
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all companies
router.get("/", async (req, res) => {
    try {
        const { tier, search } = req.query;

        const filter = {};
        if (tier) filter.tier = tier;

        let companies = await Company.find(filter).sort({ createdAt: -1 });

        if (search) {
            const q = search.toLowerCase();
            companies = companies.filter((c) => {
                const name = String(c.companyData?.companyName || "").toLowerCase();
                const email = String(c.companyData?.officialCompanyEmail || "").toLowerCase();
                return name.includes(q) || email.includes(q);
            });
        }

        res.json({ success: true, data: companies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get one company
router.get("/:id", async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }
        res.json({ success: true, data: company });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update company tier
router.put("/:id/role", async (req, res) => {
    try {
        const { role } = req.body;
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            { tier: role },
            { new: true }
        );
        if (!company) return res.status(404).json({ success: false, message: "Company not found" });
        res.json({ success: true, data: company });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Toggle company status
router.put("/:id/status", async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ success: false, message: "Company not found" });

        company.status = company.status === "active" ? "inactive" : "active";
        await company.save();
        res.json({ success: true, data: company });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete company
router.delete("/:id", async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        if (!company) return res.status(404).json({ success: false, message: "Company not found" });
        res.json({ success: true, message: "Company deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
