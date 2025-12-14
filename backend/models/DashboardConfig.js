// backend/models/DashboardConfig.js
const mongoose = require("mongoose");

const widgetSchema = new mongoose.Schema(
  {
    widgetId: { type: String, required: true }, // UUID from frontend
    type: {
      type: String,
      enum: ["kpi", "bar", "line", "area", "scatter", "pie", "table"],
      required: true,
    },
    title: { type: String, default: "Untitled" },
    description: { type: String },

    layout: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      w: { type: Number, required: true },
      h: { type: Number, required: true },
    },

    settings: {
      // KPI
      metric: String, // e.g. "totalAmount", "quantity"
      aggregation: String, // "Sum" | "Average" | "Count"
      dataFormat: { type: String, default: "Number" }, // Number | Currency
      decimalPrecision: { type: Number, default: 0 },

      // Chart & Pie
      xField: String,
      yField: String,
      chartDataField: String,
      chartColor: { type: String, default: "#54bd95" },
      showDataLabel: { type: Boolean, default: false },
      showLegend: { type: Boolean, default: true },

      // Table
      columns: [String],
      sortBy: String, // e.g. "ascending", "descending", "orderDate"
      paginationSize: Number,
      enableFilter: { type: Boolean, default: false },
      fontSize: { type: Number, default: 14 },
      headerBackground: { type: String, default: "#54bd95" },
      filters: [
        {
          field: String,
          operator: String,
          value: String,
        },
      ],
    },
  },
  { _id: false }
);

const dashboardConfigSchema = new mongoose.Schema(
  {
    // Single config for POC
    dateRange: {
      type: String,
      enum: ["all", "today", "last7", "last30", "last90"],
      default: "all",
    },
    widgets: [widgetSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DashboardConfig", dashboardConfigSchema);
