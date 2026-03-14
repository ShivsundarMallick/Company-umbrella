const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Mock user for local development
const MOCK_USER = {
    _id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "superadmin",
    permissions: ["all"]
};

// Login - using controller logic for OTP flow
router.post("/login", authController.login);

// Verify OTP - using controller logic
router.post("/verify-otp", authController.verifyOtp);

// Mock Register
router.post("/register", (req, res) => {
    res.json({
        success: true,
        data: {
            user: MOCK_USER,
            accessToken: "mock-token-" + Date.now()
        }
    });
});

// Profile - satisfying frontend user initialization
router.get("/profile", (req, res) => {
    res.json({
        success: true,
        data: {
            user: MOCK_USER
        }
    });
});

// Logout
router.post("/logout", (req, res) => {
    res.json({ success: true });
});

module.exports = router;
