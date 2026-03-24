const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { complianceDb, Company, Document } = require("../models");
const { waitForConnection } = require("../config/db");

const BASE_CATEGORIES = [
  { id: "registered-office", title: "Change of Registered Office", form: "INC-22" },
  { id: "change-directors", title: "Change in Directors", form: "DIR-12" },
  { id: "financial-statement", title: "Financial Statement Filing", form: "AOC-4" },
  { id: "annual-return", title: "Annual Return Filing", form: "MGT-7" },
  { id: "share-allotment", title: "Return of Allotment", form: "PAS-3" },
  { id: "charge-registration", title: "Charge Registration", form: "CHG-1" },
  { id: "board-resolution", title: "Board Resolution Filing", form: "MGT-14" },
  { id: "din-kyc", title: "Director KYC", form: "DIR-3 KYC" }
];

function toPositiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildCategories(targetCount) {
  if (targetCount <= BASE_CATEGORIES.length) {
    return BASE_CATEGORIES.slice(0, targetCount);
  }

  const generated = [];
  let index = 1;

  while (BASE_CATEGORIES.length + generated.length < targetCount) {
    const padded = String(index).padStart(4, "0");
    generated.push({
      id: `compliance-pack-${padded}`,
      title: `Compliance Package ${index}`,
      form: `CP-${1000 + index}`
    });
    index += 1;
  }

  return [...BASE_CATEGORIES, ...generated];
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomDateInPast(daysBackMin, daysBackMax) {
  const now = new Date();
  const minMs = daysBackMin * 24 * 60 * 60 * 1000;
  const maxMs = daysBackMax * 24 * 60 * 60 * 1000;
  const delta = randomInt(minMs, maxMs);
  return new Date(now.getTime() - delta);
}

function calculateExpiryDate(uploadedAt, docType) {
  const validityDays =
    docType === "report" ? randomInt(90, 365) : randomInt(180, 540);

  const expiryDate = new Date(uploadedAt);
  expiryDate.setDate(expiryDate.getDate() + validityDays);
  return expiryDate;
}

function buildDocument({ companyId, category, serial }) {
  const docType = Math.random() < 0.75 ? "compliance" : "report";
  const uploadedAt = randomDateInPast(15, 730);
  const expiryDate = calculateExpiryDate(uploadedAt, docType);

  const uniqueSuffix = `${Date.now()}-${serial}-${randomInt(1000, 9999)}`;

  return {
    companyId,
    categoryId: category.id,
    title: category.title,
    formName: category.form,
    docType,
    originalName: `${category.id}.pdf`,
    fileName: `${uniqueSuffix}.pdf`,
    filePath: `/uploads/${uniqueSuffix}.pdf`,
    mimeType: "application/pdf",
    size: randomInt(80_000, 5_000_000),
    uploadedAt,
    expiryDate,
    reminderSent: false,
    reminderAttempts: 0,
    lastReminderAttemptAt: null,
    lastReminderError: null
  };
}

async function getAvailablePairs(companies, categories) {
  const companyIds = companies.map((company) => company._id);
  const existingDocs = await Document.find({
    companyId: { $in: companyIds },
    categoryId: { $in: categories.map((c) => c.id) }
  })
    .select("companyId categoryId")
    .lean();

  const usedPair = new Set(
    existingDocs.map((doc) => `${String(doc.companyId)}::${doc.categoryId}`)
  );

  const available = new Map();
  for (const company of companies) {
    const companyId = String(company._id);
    const availableCategories = categories.filter(
      (category) => !usedPair.has(`${companyId}::${category.id}`)
    );

    available.set(companyId, shuffle(availableCategories));
  }

  return available;
}

async function seedDocuments() {
  const categoryCount = clamp(
    toPositiveNumber(process.env.SEED_CATEGORY_COUNT, 2000),
    BASE_CATEGORIES.length,
    5000
  );
  const CATEGORIES = buildCategories(categoryCount);
  const target = toPositiveNumber(process.argv[2] || process.env.SEED_DOC_TARGET, 5000);
  const batchSize = clamp(
    toPositiveNumber(process.argv[3] || process.env.SEED_DOC_BATCH_SIZE, 300),
    100,
    500
  );

  console.log(
    `[SeedDocuments] target=${target}, batchSize=${batchSize}, categories=${CATEGORIES.length}`
  );

  try {
    await waitForConnection(complianceDb, "complianceDb");

    await Document.createIndexes();

    const companies = await Company.find({})
      .select("_id")
      .lean();

    if (!companies.length) {
      throw new Error("No companies found. Seed company data first.");
    }

    const availableByCompany = await getAvailablePairs(companies, CATEGORIES);

    const companyQueue = shuffle(
      companies.map((company) => ({
        companyId: String(company._id),
        categories: availableByCompany.get(String(company._id)) || []
      }))
    );

    const maxPossible = companyQueue.reduce(
      (sum, entry) => sum + entry.categories.length,
      0
    );

    if (maxPossible === 0) {
      console.log("[SeedDocuments] No available company/category pairs left.");
      return;
    }

    const finalTarget = Math.min(target, maxPossible);
    if (finalTarget < target) {
      console.warn(
        `[SeedDocuments] Requested ${target}, but only ${finalTarget} unique pairs are available.`
      );
    }

    const selectedPairs = [];

    let hasRemaining = true;
    while (selectedPairs.length < finalTarget && hasRemaining) {
      hasRemaining = false;

      for (const entry of companyQueue) {
        if (selectedPairs.length >= finalTarget) break;

        if (entry.categories.length) {
          const category = entry.categories.pop();
          selectedPairs.push({ companyId: entry.companyId, category });
          hasRemaining = true;
        }
      }
    }

    console.log(`[SeedDocuments] Prepared ${selectedPairs.length} documents for insertion.`);

    let inserted = 0;
    let duplicates = 0;

    for (let i = 0; i < selectedPairs.length; i += batchSize) {
      const chunk = selectedPairs.slice(i, i + batchSize);
      const payload = chunk.map((pair, index) =>
        buildDocument({
          companyId: pair.companyId,
          category: pair.category,
          serial: i + index
        })
      );

      try {
        const result = await Document.insertMany(payload, { ordered: false });
        inserted += result.length;
      } catch (error) {
        if (error?.writeErrors?.length) {
          duplicates += error.writeErrors.length;
          inserted += payload.length - error.writeErrors.length;
        } else {
          throw error;
        }
      }

      console.log(
        `[SeedDocuments] Batch ${Math.floor(i / batchSize) + 1}: inserted=${inserted}, duplicates=${duplicates}`
      );
    }

    console.log(
      `[SeedDocuments] Done. inserted=${inserted}, duplicates=${duplicates}, target=${finalTarget}`
    );
  } catch (error) {
    console.error("[SeedDocuments] Failed:", error.message);
    process.exitCode = 1;
  } finally {
    await complianceDb.close();
  }
}

seedDocuments();
