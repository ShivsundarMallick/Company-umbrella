const express = require("express");
const {
  getReports,
  getReportById,
  exportPdf,
  exportExcel,
  exportCsv
} = require("../controllers/reportController");

const router = express.Router();

router.get("/", getReports);
router.get("/export/pdf/:id?", exportPdf);
router.get("/export/excel/:id?", exportExcel);
router.get("/export/csv/:id?", exportCsv);
router.get("/:id", getReportById);

module.exports = router;
