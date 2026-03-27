const express = require("express");
const { exportPdf, exportExcel, exportCsv } = require("../controllers/reportController");

const router = express.Router();

router.get("/pdf/:id?", exportPdf);
router.get("/excel/:id?", exportExcel);
router.get("/csv/:id?", exportCsv);

module.exports = router;
