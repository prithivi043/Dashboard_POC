const mongoose = require("mongoose");

const { Schema } = mongoose;

const fieldSchema = new Schema(
  {
    name: { type: String, required: true },   // e.g. "totalAmount"
    label: { type: String },                  // e.g. "Total Amount"
    dataType: {
      type: String,
      enum: ["string", "number", "date", "boolean", "unknown"],
      default: "unknown",
    },
    isMetric: { type: Boolean, default: false },
    isDimension: { type: Boolean, default: true },
  },
  { _id: false }
);

// Small preview rows only (for UI preview)
const previewRowSchema = new Schema(
  {},
  {
    _id: false,
    strict: false, // allow arbitrary keys (Excel columns)
  }
);

const datasetSchema = new Schema(
  {
    userId: { type: String, index: true }, // optional

    name: { type: String, required: true }, // e.g. "Customer Orders – Nov"
    description: { type: String },

    originalFileName: { type: String },
    sourceType: {
      type: String,
      enum: ["excel-upload", "csv-upload", "api"],
      default: "excel-upload",
    },

    filePath: { type: String, required: true }, // where the Excel file is stored
    fileSize: { type: Number, default: 0 },

    rowCount: { type: Number, default: 0 },

    fields: [fieldSchema],

    // only a small subset
    sampleRows: [previewRowSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dataset", datasetSchema);
