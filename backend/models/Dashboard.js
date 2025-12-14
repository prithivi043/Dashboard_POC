const mongoose = require("mongoose");

const { Schema } = mongoose;

const widgetSettingsSchema = new Schema(
  {
    metricField: String, // e.g. "totalAmount"
    aggregation: {
      type: String,
      enum: ["Sum", "Average", "Count", "Min", "Max"],
      default: "Sum",
    },
    dataFormat: {
      type: String,
      enum: ["Number", "Currency", "Percentage"],
      default: "Number",
    },
    decimalPrecision: { type: Number, default: 0 },

    xField: String,
    yField: String,
    groupByField: String,
    chartColor: { type: String, default: "#54bd95" },
    showDataLabel: { type: Boolean, default: false },
    showLegend: { type: Boolean, default: true },

    columns: [String],
    sortBy: String, // e.g. "orderDate_desc"
    paginationSize: { type: Number, default: 25 },
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
  { _id: false }
);

const widgetSchema = new Schema(
  {
    widgetId: { type: String, required: true },

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

    settings: widgetSettingsSchema,
  },
  { _id: false }
);

const dashboardSchema = new Schema(
  {
    userId: { type: String, index: true }, // optional
    name: { type: String, required: true },

    dataset: {
      type: Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
    },

    dateRange: {
      type: String,
      enum: ["all", "today", "last7", "last30", "last90"],
      default: "all",
    },

    widgets: [widgetSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dashboard", dashboardSchema);
