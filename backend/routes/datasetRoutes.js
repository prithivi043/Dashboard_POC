// backend/routes/datasetRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const Dataset = require("../models/Dataset");

const router = express.Router();

// Where to store uploaded files
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

/**
 * POST /api/datasets/upload
 * Form-data: file=<Excel file>
 * Returns: dataset metadata (including _id, fields, sampleRows)
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, path: filePath, size } = req.file;

    // Read Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });
    const rowCount = rows.length;

    const firstRow = rows[0] || {};
    const fields = Object.keys(firstRow).map((key) => {
      const val = firstRow[key];
      let dataType = "unknown";
      if (typeof val === "number") dataType = "number";
      else if (val instanceof Date) dataType = "date";
      else if (typeof val === "boolean") dataType = "boolean";
      else if (typeof val === "string") dataType = "string";

      return {
        name: key,
        label: key,
        dataType,
        isMetric: dataType === "number",
        isDimension: dataType !== "number"
      };
    });

    const sampleRows = rows.slice(0, 50);

    const dataset = await Dataset.create({
      userId: null, // plug actual user if available
      name: path.basename(originalname, path.extname(originalname)),
      originalFileName: originalname,
      sourceType: "excel-upload",
      filePath,
      fileSize: size,
      rowCount,
      fields,
      sampleRows
    });

    return res.status(201).json(dataset);
  } catch (err) {
    console.error("Error uploading dataset:", err);
    return res.status(500).json({ message: "Error uploading dataset" });
  }
});

/**
 * GET /api/datasets/:id
 * Returns dataset metadata + sampleRows (no full data)
 */
router.get("/:id", async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }
    return res.json(dataset);
  } catch (err) {
    console.error("Error fetching dataset:", err);
    return res.status(500).json({ message: "Error fetching dataset" });
  }
});

/**
 * GET /api/datasets/:id/rows
 * Returns full rows, reading from Excel on demand.
 * For large datasets, use ?limit=1000 etc.
 */
router.get("/:id/rows", async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    const limit = parseInt(req.query.limit || "0", 10);

    const workbook = xlsx.readFile(dataset.filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

    let resultRows = rows;
    if (limit > 0) {
      resultRows = rows.slice(0, limit);
    }

    return res.json({ rows: resultRows, rowCount: rows.length });
  } catch (err) {
    console.error("Error reading dataset rows:", err);
    return res.status(500).json({ message: "Error reading dataset rows" });
  }
});

module.exports = router;
