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
  limits: { fileSize: 20 * 1024 * 1024 }
});

router.post("/:companyId/upload", upload.single("file"), uploadDocument);
router.get("/:companyId", getDocumentsByCompany);
router.get("/file/:documentId", getDocumentFile);
router.delete("/:documentId", deleteDocument);

module.exports = router;
