const { Document, Company } = require("../models");
const sendEmail = require("../utils/sendEmail");

let runState = {
  running: false,
  startedAt: null,
  source: null,
  lastCompletedAt: null,
  lastSummary: null
};

function safeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getReminderConfig() {
  return {
    lookaheadDays: safeNumber(process.env.REMINDER_LOOKAHEAD_DAYS, 15),
    batchSize: clamp(safeNumber(process.env.REMINDER_BATCH_SIZE, 300), 100, 500),
    concurrency: safeNumber(process.env.REMINDER_CONCURRENCY, 10),
    maxRetryAttempts: safeNumber(process.env.REMINDER_MAX_RETRY_ATTEMPTS, 5),
    fallbackEmail: process.env.REMINDER_FALLBACK_EMAIL || "",
    maxItemsPerEmail: safeNumber(process.env.REMINDER_MAX_ITEMS_PER_EMAIL, 25)
  };
}

function getWindow(days) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

function getCompanyEmail(company) {
  if (!company) return null;
  if (company.email) return company.email;

  const data = company.companyData || {};
  return (
    data.email ||
    data.companyEmail ||
    data.officialCompanyEmail ||
    data.contactEmail ||
    data.ownerEmail ||
    data.adminEmail ||
    null
  );
}

function getCompanyName(company) {
  if (!company) return "Company";
  if (company.name) return company.name;

  const data = company.companyData || {};
  return data.companyName || data.name || data.legalName || "Company";
}

function buildReminderMessage(companyName, docs, lookaheadDays, maxItems) {
  const sortedDocs = docs
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    .map((doc) => doc);

  const visibleDocs = sortedDocs.slice(0, maxItems);
  const hiddenCount = Math.max(0, sortedDocs.length - visibleDocs.length);

  const lines = visibleDocs.map(
      (doc, index) =>
        `${index + 1}. ${doc.title} (${doc.categoryId}) - expires on ${new Date(doc.expiryDate).toDateString()}`
  );

  const suffix = hiddenCount
    ? `\n\n...and ${hiddenCount} more document(s) in this reminder window.`
    : "";

  return `Dear ${companyName},

The following document(s) are expiring within ${lookaheadDays} day(s):

${lines.join("\n")}${suffix}

Please renew them before expiry.

Thanks,
Compliance Team`;
}

async function runWithConcurrency(items, limit, handler) {
  const results = [];
  let cursor = 0;

  const workers = Array.from({ length: limit }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await handler(items[index]);
    }
  });

  await Promise.all(workers);
  return results;
}

async function processReminderBatch({ startDate, endDate, lastId, config }) {
  const query = {
    reminderSent: false,
    reminderAttempts: { $lt: config.maxRetryAttempts },
    expiryDate: { $gte: startDate, $lte: endDate }
  };

  if (lastId) {
    query._id = { $gt: lastId };
  }

  const documents = await Document.find(query)
    .select("_id companyId categoryId title expiryDate")
    .sort({ _id: 1 })
    .limit(config.batchSize)
    .lean();

  if (!documents.length) {
    return { done: true, lastId: null, docs: 0, emails: 0, marked: 0, failed: 0 };
  }

  const companyIds = [...new Set(documents.map((doc) => String(doc.companyId)))];
  const companies = await Company.find({ _id: { $in: companyIds } }).lean();
  const companyMap = new Map(companies.map((company) => [String(company._id), company]));

  const docsByCompany = new Map();
  for (const doc of documents) {
    const key = String(doc.companyId);
    if (!docsByCompany.has(key)) docsByCompany.set(key, []);
    docsByCompany.get(key).push(doc);
  }

  const entries = [...docsByCompany.entries()];
  const now = new Date();

  const sendResults = await runWithConcurrency(entries, config.concurrency, async ([companyId, docs]) => {
    const company = companyMap.get(companyId);

    if (!company) {
      return {
        sent: false,
        error: "Company not found",
        docIds: docs.map((doc) => doc._id)
      };
    }

    const toEmail = getCompanyEmail(company) || config.fallbackEmail;

    if (!toEmail) {
      return {
        sent: false,
        error: "Company email missing",
        docIds: docs.map((doc) => doc._id)
      };
    }

    const text = buildReminderMessage(
      getCompanyName(company),
      docs,
      config.lookaheadDays,
      config.maxItemsPerEmail
    );

    try {
      await sendEmail({
        to: toEmail,
        subject: `Document Expiry Reminder (${docs.length})`,
        text
      });

      return {
        sent: true,
        error: null,
        docIds: docs.map((doc) => doc._id)
      };
    } catch (error) {
      return {
        sent: false,
        error: error.message || "Email send failed",
        docIds: docs.map((doc) => doc._id)
      };
    }
  });

  const sentDocIds = sendResults.filter((result) => result.sent).flatMap((result) => result.docIds);
  const failedResults = sendResults.filter((result) => !result.sent);

  const bulkOps = [];

  if (sentDocIds.length) {
    bulkOps.push({
      updateMany: {
        filter: { _id: { $in: sentDocIds } },
        update: {
          $set: {
            reminderSent: true,
            lastReminderAttemptAt: now,
            lastReminderError: null
          },
          $inc: { reminderAttempts: 1 }
        }
      }
    });
  }

  for (const failedResult of failedResults) {
    bulkOps.push({
      updateMany: {
        filter: { _id: { $in: failedResult.docIds } },
        update: {
          $set: {
            lastReminderAttemptAt: now,
            lastReminderError: String(failedResult.error || "Reminder failed").slice(0, 500)
          },
          $inc: { reminderAttempts: 1 }
        }
      }
    });
  }

  let marked = 0;
  if (bulkOps.length) {
    const writeResult = await Document.bulkWrite(bulkOps, { ordered: false });
    marked = writeResult.modifiedCount || 0;
  }

  return {
    done: false,
    lastId: documents[documents.length - 1]._id,
    docs: documents.length,
    emails: sendResults.filter((result) => result.sent).length,
    marked,
    failed: failedResults.length
  };
}

async function runReminderCycle(options = {}) {
  if (runState.running && !options.force) {
    return {
      success: false,
      skipped: true,
      message: "Reminder job is already running",
      state: runState
    };
  }

  runState = {
    ...runState,
    running: true,
    source: options.source || "manual",
    startedAt: new Date()
  };

  const startedAt = Date.now();
  const config = getReminderConfig();
  const days = safeNumber(options.days, config.lookaheadDays);
  const { startDate, endDate } = getWindow(days);

  const summary = {
    success: true,
    skipped: false,
    source: runState.source,
    window: { days, startDate, endDate },
    config,
    totals: {
      docs: 0,
      emails: 0,
      marked: 0,
      failed: 0,
      batches: 0
    },
    durationMs: 0
  };

  try {
    let lastId = null;

    while (true) {
      const batch = await processReminderBatch({ startDate, endDate, lastId, config: { ...config, lookaheadDays: days } });

      if (batch.done) break;

      lastId = batch.lastId;
      summary.totals.docs += batch.docs;
      summary.totals.emails += batch.emails;
      summary.totals.marked += batch.marked;
      summary.totals.failed += batch.failed;
      summary.totals.batches += 1;
    }

    summary.durationMs = Date.now() - startedAt;
    runState = {
      ...runState,
      running: false,
      lastCompletedAt: new Date(),
      lastSummary: summary
    };

    return summary;
  } catch (error) {
    summary.success = false;
    summary.error = error.message;
    summary.durationMs = Date.now() - startedAt;

    runState = {
      ...runState,
      running: false,
      lastCompletedAt: new Date(),
      lastSummary: summary
    };

    throw error;
  }
}

async function getReminderStats(days) {
  const config = getReminderConfig();
  const normalizedDays = safeNumber(days, config.lookaheadDays);
  const { startDate, endDate } = getWindow(normalizedDays);

  const baseRangeFilter = { expiryDate: { $gte: startDate, $lte: endDate } };

  const [totalInWindow, pending, sent, failedRetryable, retryExhausted, recentFailures] =
    await Promise.all([
      Document.countDocuments(baseRangeFilter),
      Document.countDocuments({
        ...baseRangeFilter,
        reminderSent: false,
        reminderAttempts: { $lt: config.maxRetryAttempts }
      }),
      Document.countDocuments({
        ...baseRangeFilter,
        reminderSent: true
      }),
      Document.countDocuments({
        ...baseRangeFilter,
        reminderSent: false,
        reminderAttempts: { $gt: 0, $lt: config.maxRetryAttempts }
      }),
      Document.countDocuments({
        ...baseRangeFilter,
        reminderSent: false,
        reminderAttempts: { $gte: config.maxRetryAttempts }
      }),
      Document.find({
        ...baseRangeFilter,
        reminderSent: false,
        lastReminderError: { $ne: null }
      })
        .select("companyId title categoryId expiryDate reminderAttempts lastReminderAttemptAt lastReminderError")
        .sort({ lastReminderAttemptAt: -1 })
        .limit(20)
        .lean()
    ]);

  return {
    window: {
      days: normalizedDays,
      startDate,
      endDate
    },
    retryPolicy: {
      maxRetryAttempts: config.maxRetryAttempts
    },
    counts: {
      totalInWindow,
      pending,
      sent,
      failedRetryable,
      retryExhausted
    },
    runState,
    recentFailures
  };
}

function getReminderRunState() {
  return runState;
}

module.exports = {
  getReminderConfig,
  getReminderRunState,
  getReminderStats,
  runReminderCycle
};
