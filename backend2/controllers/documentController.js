const { Document } = require("../models");

exports.uploadDocument = async (req, res) => {
  try {
    const { companyId, categoryId, title, formName, docType } = req.body;

    const uploadedAt = new Date();

    // ✅ Set expiry = 1 year from upload
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const doc = await Document.create({
      companyId,
      categoryId,
      title,
      formName,
      docType,
      uploadedAt,
      expiryDate,

      // file info (if using multer)
      originalName: req.file?.originalname,
      fileName: req.file?.filename,
      filePath: req.file?.path,
      mimeType: req.file?.mimetype,
      size: req.file?.size
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      data: doc
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};
