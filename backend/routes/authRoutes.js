<<<<<<< HEAD
const express = require('express');
const { login, verifyOtp } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/verify-otp', verifyOtp);
=======
const express = require("express");
const router = express.Router();

// Mock user for local development
const MOCK_USER = {
    _id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "superadmin",
    permissions: ["all"]
};

// Login
router.post("/login", (req, res) => {
    res.json({
        success: true,
        data: {
            user: MOCK_USER,
            accessToken: "mock-token-" + Date.now()
        }
    });
});

// Register
router.post("/register", (req, res) => {
    res.json({
        success: true,
        data: {
            user: MOCK_USER,
            accessToken: "mock-token-" + Date.now()
        }
    });
});

// Profile
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
>>>>>>> da33c31 (added companies)

module.exports = router;
