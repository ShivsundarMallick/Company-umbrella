const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
  'http://localhost:3789',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS configuration
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Test route
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Company Umbrella Auth API running',
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

module.exports = app;
