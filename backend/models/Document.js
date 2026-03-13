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
        formName: {
            type: String
        },
        docType: {
            type: String,
            enum: ["compliance", "report"],
            required: true
        },
        originalName: String,
        fileName: String,
        filePath: String,
        mimeType: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// one current file per category for one company
DocumentSchema.index({ companyId: 1, categoryId: 1 }, { unique: true });

module.exports = mongoose.model("Document", DocumentSchema);