const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    categoryId: {
      type: String,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    formName: String,

    docType: {
      type: String,
      enum: ["compliance", "report"],
      required: true
    },

    // 📁 File Info
    originalName: String,
    fileName: String,
    filePath: String,
    mimeType: String,
    size: Number,

    // ⏱ Upload Info
    uploadedAt: {
      type: Date,
      default: Date.now
    },

    // 🔔 Expiry Date
    expiryDate: {
      type: Date,
      required: true
    },

    // 🚫 Prevent duplicate reminder
    reminderSent: {
      type: Boolean,
      default: false
    },

    reminderAttempts: {
      type: Number,
      default: 0
    },

    lastReminderAttemptAt: {
      type: Date,
      default: null
    },

    lastReminderError: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// Indexes
DocumentSchema.index({ companyId: 1, categoryId: 1 }, { unique: true });
DocumentSchema.index({ expiryDate: 1 });
DocumentSchema.index({ reminderSent: 1, expiryDate: 1, companyId: 1 });
DocumentSchema.index({ reminderSent: 1, reminderAttempts: 1, expiryDate: 1 });

// ✅ EXPORT ONLY SCHEMA (IMPORTANT)
module.exports = DocumentSchema;
