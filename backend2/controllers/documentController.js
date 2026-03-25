const fs = require("fs");
const path = require("path");
const { Company, Document } = require("../models");

function getExpiryDateFromUpload(uploadedAt) {
  const expiryDate = new Date(uploadedAt);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  return expiryDate;
}

function toUploadsUrl(fileName) {
  return `/uploads/${fileName}`;
}

function toLocalFilePath(storedFilePath) {
  if (!storedFilePath) return null;
  const normalized = storedFilePath.replace(/^\/+/, "");
  return path.join(__dirname, "..", normalized);
}

async function removeFileIfExists(storedFilePath) {
  const absolutePath = toLocalFilePath(storedFilePath);
  if (!absolutePath) return;

  try {
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("[DocumentUpload] Unable to delete old file:", error.message);
    }
  }
}

exports.uploadDocument = async (req, res) => {
  try {
    const companyId = req.params.companyId || req.body.companyId;
    const { categoryId, title, formName, docType } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    if (!categoryId || !title || !docType) {
      return res.status(400).json({ message: "categoryId, title, and docType are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const company = await Company.findById(companyId).select("_id").lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const uploadedAt = new Date();
    const expiryDate = getExpiryDateFromUpload(uploadedAt);
    const filePath = toUploadsUrl(req.file.filename);

    const filter = { companyId, categoryId };
    const existing = await Document.findOne(filter).select("_id filePath").lean();

    if (existing?.filePath) {
      await removeFileIfExists(existing.filePath);
    }

    const update = {
      title,
      formName,
      docType,
      uploadedAt,
      expiryDate,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath,
      mimeType: req.file.mimetype,
      size: req.file.size,
      reminderSent: false,
      reminderAttempts: 0,
      lastReminderAttemptAt: null,
      lastReminderError: null
    };

    const document = await Document.findOneAndUpdate(
      filter,
      {
        $set: update,
        $setOnInsert: { companyId, categoryId }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    return res.status(existing ? 200 : 201).json({
      message: existing ? "Document updated successfully" : "Document uploaded successfully",
      document
    });
  } catch (error) {
    console.error("[DocumentUpload] Error:", error);
    return res.status(500).json({ message: "Upload failed" });
  }
};

exports.getDocumentsByCompany = async (req, res) => {
  try {
    const docs = await Document.find({ companyId: req.params.companyId }).sort({ createdAt: -1 });
    return res.json(docs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getDocumentFile = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.documentId).select("filePath");
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    return res.json({ fileUrl: `${process.env.BASE_URL}${doc.filePath}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.documentId);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    await removeFileIfExists(doc.filePath);
    await doc.deleteOne();

    return res.json({ message: "Document deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
