const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Company = require("../models/Company");
const Document = require("../models/Document");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const safeName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});

// Upload/replace one document for a company
router.post("/:companyId/upload", upload.single("file"), async (req, res) => {
    try {
        const { companyId } = req.params;
        const { categoryId, title, formName, docType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "File is required" });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        const filePath = `/uploads/${req.file.filename}`;

        // If same category already exists, replace old file
        const existing = await Document.findOne({ companyId, categoryId });
        if (existing) {
            if (existing.filePath) {
                const oldFile = path.join(__dirname, "..", existing.filePath);
                if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
            }
            existing.title = title || existing.title;
            existing.formName = formName || existing.formName;
            existing.docType = docType || existing.docType;
            existing.originalName = req.file.originalname;
            existing.fileName = req.file.filename;
            existing.filePath = filePath;
            existing.mimeType = req.file.mimetype;
            existing.size = req.file.size;

            await existing.save();

            return res.json({
                message: "Document updated successfully",
                document: existing
            });
        }

        const document = await Document.create({
            companyId,
            categoryId,
            title,
            formName,
            docType,
            originalName: req.file.originalname,
            fileName: req.file.filename,
            filePath,
            mimeType: req.file.mimetype,
            size: req.file.size
        });

        res.status(201).json({
            message: "Document uploaded successfully",
            document
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all uploaded docs for a company
router.get("/:companyId", async (req, res) => {
    try {
        const docs = await Document.find({ companyId: req.params.companyId }).sort({
            createdAt: -1
        });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get one file download URL
router.get("/file/:documentId", async (req, res) => {
    try {
        const doc = await Document.findById(req.params.documentId);
        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.json({
            fileUrl: `${process.env.BASE_URL}${doc.filePath}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a document
router.delete("/:documentId", async (req, res) => {
    try {
        const doc = await Document.findById(req.params.documentId);
        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        const fileOnDisk = path.join(__dirname, "..", doc.filePath);
        if (fs.existsSync(fileOnDisk)) fs.unlinkSync(fileOnDisk);

        await doc.deleteOne();

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;