const express = require("express");
const { Company, Document } = require("../models");
const {
  getReminderRunState,
  getReminderStats,
  runReminderCycle
} = require("../services/reminderService");

const router = express.Router();

function toPositiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function parseStatusFilter(status, maxRetryAttempts) {
  if (status === "sent") {
    return { reminderSent: true };
  }

  if (status === "failed") {
    return {
      reminderSent: false,
      reminderAttempts: { $gte: maxRetryAttempts }
    };
  }

  if (status === "pending") {
    return {
      reminderSent: false,
      reminderAttempts: { $lt: maxRetryAttempts }
    };
  }

  return {};
}

router.get("/stats", async (req, res) => {
  try {
    const stats = await getReminderStats(req.query.days);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load reminder stats",
      error: error.message
    });
  }
});

router.get("/activity", async (req, res) => {
  const limit = Math.min(toPositiveNumber(req.query.limit, 50), 200);
  const days = toPositiveNumber(req.query.days, Number(process.env.REMINDER_LOOKAHEAD_DAYS || 15));
  const maxRetryAttempts = toPositiveNumber(process.env.REMINDER_MAX_RETRY_ATTEMPTS, 5);
  const status = String(req.query.status || "all").toLowerCase();

  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  endDate.setHours(23, 59, 59, 999);

  try {
    const query = {
      expiryDate: { $gte: startDate, $lte: endDate },
      ...parseStatusFilter(status, maxRetryAttempts)
    };

    const docs = await Document.find(query)
      .select(
        "_id companyId title categoryId formName docType expiryDate reminderSent reminderAttempts lastReminderAttemptAt lastReminderError"
      )
      .sort({ lastReminderAttemptAt: -1, expiryDate: 1 })
      .limit(limit)
      .lean();

    const companyIds = [...new Set(docs.map((doc) => String(doc.companyId)))];
    const companies = await Company.find({ _id: { $in: companyIds } })
      .select("_id companyData")
      .lean();

    const companyMap = new Map(
      companies.map((company) => [String(company._id), company.companyData || {}])
    );

    const activity = docs.map((doc) => {
      const companyData = companyMap.get(String(doc.companyId)) || {};
      const companyName =
        companyData.companyName || companyData.name || companyData.legalName || "Company";
      const companyEmail =
        companyData.email ||
        companyData.companyEmail ||
        companyData.officialCompanyEmail ||
        companyData.contactEmail ||
        null;

      return {
        id: doc._id,
        companyId: doc.companyId,
        companyName,
        companyEmail,
        title: doc.title,
        categoryId: doc.categoryId,
        formName: doc.formName,
        docType: doc.docType,
        expiryDate: doc.expiryDate,
        reminderSent: doc.reminderSent,
        reminderAttempts: doc.reminderAttempts,
        lastReminderAttemptAt: doc.lastReminderAttemptAt,
        lastReminderError: doc.lastReminderError,
        status: doc.reminderSent
          ? "sent"
          : doc.reminderAttempts >= maxRetryAttempts
            ? "failed"
            : "pending"
      };
    });

    res.json({
      success: true,
      data: {
        filters: { status, days, limit },
        activity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load reminder activity",
      error: error.message
    });
  }
});

router.get("/state", (req, res) => {
  res.json({
    success: true,
    data: getReminderRunState()
  });
});

router.post("/run-now", async (req, res) => {
  const days = toPositiveNumber(req.body?.days, undefined);
  const force = Boolean(req.body?.force);

  try {
    const result = await runReminderCycle({
      source: "manual-api",
      days,
      force
    });

    if (result.skipped) {
      return res.status(409).json({
        success: false,
        message: result.message,
        data: result
      });
    }

    return res.json({
      success: true,
      message: "Reminder run completed",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Reminder run failed",
      error: error.message
    });
  }
});

module.exports = router;
