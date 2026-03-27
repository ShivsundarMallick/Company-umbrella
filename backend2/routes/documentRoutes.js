const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  uploadDocument,
  getDocumentsByCompany,
  getDocumentFile,
  deleteDocument
} = require("../controllers/documentController");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExt = path.extname(file.originalname || "").toLowerCase() === ".pdf";

    if (isPdfMime || isPdfExt) {
      cb(null, true);
      return;
    }

    cb(new Error("Only PDF files are allowed"));
  }
});

router.post("/:companyId/upload", (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      const message =
        error.message || "Upload failed. Please upload a valid PDF under 10MB.";
      return res.status(400).json({ message });
    }
    return uploadDocument(req, res, next);
  });
});
router.get("/:companyId", getDocumentsByCompany);
router.get("/file/:documentId", getDocumentFile);
router.delete("/:documentId", deleteDocument);

module.exports = router;
