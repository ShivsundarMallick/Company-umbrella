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

    reportId: {
      type: String
    },

    formName: String,

    docType: {
      type: String,
      enum: ["compliance", "report"],
      required: true
    },

    // File info
    originalName: String,
    fileName: String,
    filePath: String,
    mimeType: String,
    size: Number,

    // Registration/upload info
    registeredAt: {
      type: Date,
      default: Date.now
    },

    uploadedAt: {
      type: Date,
      default: Date.now
    },

    // Expiry/reminder
    expiryDate: {
      type: Date,
      required: true
    },

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

DocumentSchema.pre("save", async function assignReportId(next) {
  if (this.docType !== "report" || this.reportId) {
    return next();
  }

  try {
    const [latest] = await this.constructor.aggregate([
      { $match: { reportId: { $regex: /^rpt-\d+$/ } } },
      {
        $project: {
          sequence: {
            $toInt: {
              $arrayElemAt: [{ $split: ["$reportId", "-"] }, 1]
            }
          }
        }
      },
      { $sort: { sequence: -1 } },
      { $limit: 1 }
    ]);

    const nextSequence = (latest?.sequence || 0) + 1;
    this.reportId = `rpt-${String(nextSequence).padStart(3, "0")}`;
    return next();
  } catch (error) {
    return next(error);
  }
});

DocumentSchema.index({ companyId: 1, categoryId: 1 }, { unique: true });
DocumentSchema.index(
  { reportId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      reportId: { $type: "string" }
    }
  }
);
DocumentSchema.index({ expiryDate: 1 });
DocumentSchema.index({ reminderSent: 1, expiryDate: 1, companyId: 1 });
DocumentSchema.index({ reminderSent: 1, reminderAttempts: 1, expiryDate: 1 });

module.exports = DocumentSchema;
