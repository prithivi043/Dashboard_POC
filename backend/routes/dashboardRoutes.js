const express = require("express");
const Dashboard = require("../models/Dashboard");

const router = express.Router();

/**
 * GET /api/dashboards/by-dataset/:datasetId
 * Returns dashboard for given dataset (creates empty one if none).
 */
router.get("/by-dataset/:datasetId", async (req, res) => {
  try {
    const { datasetId } = req.params;
    const userId = req.query.userId || null;

    let dashboard = await Dashboard.findOne({ dataset: datasetId, userId });

    if (!dashboard) {
      dashboard = await Dashboard.create({
        userId,
        name: "Default Dashboard",
        dataset: datasetId,
        dateRange: "all",
        widgets: [],
      });
    }

    return res.json(dashboard);
  } catch (err) {
    console.error("Error fetching dashboard:", err);
    return res.status(500).json({ message: "Error fetching dashboard" });
  }
});

/**
 * PUT /api/dashboards/by-dataset/:datasetId
 * Body: { name?, dateRange?, widgets: [...] }
 */
router.put("/by-dataset/:datasetId", async (req, res) => {
  try {
    const { datasetId } = req.params;
    const userId = req.body.userId || null;

    const update = {};
    if (req.body.name) update.name = req.body.name;
    if (req.body.dateRange) update.dateRange = req.body.dateRange;
    if (Array.isArray(req.body.widgets)) update.widgets = req.body.widgets;

    const dashboard = await Dashboard.findOneAndUpdate(
      { dataset: datasetId, userId },
      update,
      { new: true, upsert: true }
    );

    return res.json(dashboard);
  } catch (err) {
    console.error("Error saving dashboard:", err);
    return res.status(500).json({ message: "Error saving dashboard" });
  }
});

module.exports = router;
