// src/components/WidgetSettingsPanel.jsx
import React, { useEffect, useState } from "react";

const numberOr = (val, fallback) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

const WidgetSettingsPanel = ({ widget, onApply, onCancel }) => {
  const [localWidget, setLocalWidget] = useState(() => ({
    ...widget,
    layout: { w: widget.layout?.w ?? 4, h: widget.layout?.h ?? 4 },
    settings: { ...(widget.settings || {}) },
  }));

  useEffect(() => {
    if (!widget) return;
    setLocalWidget({
      ...widget,
      layout: {
        w: widget.layout?.w ?? 4,
        h: widget.layout?.h ?? 4,
      },
      settings: { ...(widget.settings || {}) },
    });
  }, [widget]);

  if (!widget) return null;

  const { type } = localWidget;

  const updateField = (field, value) => {
    setLocalWidget((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateLayoutField = (field, value) => {
    setLocalWidget((prev) => {
      const current = prev.layout || { w: 4, h: 4 };
      let nextVal = numberOr(value, current[field] || 1);

      if (field === "w") {
        if (nextVal < 1) nextVal = 1;
        if (nextVal > 12) nextVal = 12; // 12-column grid
      } else if (field === "h") {
        if (nextVal < 1) nextVal = 1;
        if (nextVal > 8) nextVal = 8; // safe upper bound, tweak if you like
      }

      return {
        ...prev,
        layout: {
          ...current,
          [field]: nextVal,
        },
      };
    });
  };

  const updateSetting = (key, value) => {
    setLocalWidget((prev) => ({
      ...prev,
      settings: {
        ...(prev.settings || {}),
        [key]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onApply) return;
    onApply(localWidget);
  };

  const settings = localWidget.settings || {};
  const layout = localWidget.layout || { w: 4, h: 4 };

  // Options (you can expand these if needed)
  const numericMetrics = [
    { value: "totalAmount", label: "Total amount" },
    { value: "unitPrice", label: "Unit price" },
    { value: "quantity", label: "Quantity" },
  ];

  const aggregations = [
    { value: "Sum", label: "Sum" },
    { value: "Average", label: "Average" },
    { value: "Count", label: "Count" },
  ];

  const dataFormats = [
    { value: "Number", label: "Number" },
    { value: "Currency", label: "Currency" },
  ];

  const cartesianDimensions = [
    { value: "product", label: "Product / Category" },
    { value: "status", label: "Status" },
    { value: "createdBy", label: "Created by" },
  ];

  const pieDimensions = [
    { value: "product", label: "Product / Category" },
    { value: "status", label: "Status" },
    { value: "createdBy", label: "Created by" },
  ];

  const tableColumns = [
    { value: "firstName", label: "First name" },
    { value: "lastName", label: "Last name" },
    { value: "emailId", label: "Email id" },
    { value: "phoneNumber", label: "Phone number" },
    { value: "streetAddress", label: "Address" },
    { value: "product", label: "Product" },
    { value: "quantity", label: "Quantity" },
    { value: "unitPrice", label: "Unit price" },
    { value: "totalAmount", label: "Total amount" },
    { value: "status", label: "Status" },
    { value: "createdBy", label: "Created by" },
    { value: "orderDate", label: "Order date" },
  ];

  const selectedColumns = settings.columns || [
    "firstName",
    "lastName",
    "product",
    "status",
    "totalAmount",
  ];

  const toggleColumn = (colValue) => {
    const exists = selectedColumns.includes(colValue);
    const next = exists
      ? selectedColumns.filter((c) => c !== colValue)
      : [...selectedColumns, colValue];
    updateSetting("columns", next);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col bg-slate-950 text-slate-100"
    >
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Basic info */}
        <section className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-white mb-1">
              Widget title
            </label>
            <input
              type="text"
              value={localWidget.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500"
              placeholder="Untitled"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Widget type
              </label>
              <input
                type="text"
                value={type}
                disabled
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={localWidget.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500"
              placeholder="Optional description for this widget"
            />
          </div>
        </section>

        {/* Widget Size */}
        <section className="space-y-2 border-t border-slate-800 pt-3">
          <p className="text-[11px] font-semibold text-slate-200">
            Widget size
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Width (columns)
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={layout.w ?? 4}
                onChange={(e) => updateLayoutField("w", e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                12-column grid on desktop.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Height (rows)
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={layout.h ?? 4}
                onChange={(e) => updateLayoutField("h", e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                Each row equals the grid row height.
              </p>
            </div>
          </div>
        </section>

        {/* KPI Settings */}
        {type === "kpi" && (
          <section className="space-y-2 border-t border-slate-800 pt-3">
            <p className="text-[11px] font-semibold text-slate-200">
              KPI configuration
            </p>

            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Select metric
              </label>
              <select
                value={settings.metric || "totalAmount"}
                onChange={(e) => updateSetting("metric", e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
              >
                {numericMetrics.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Aggregation
              </label>
              <select
                value={settings.aggregation || "Sum"}
                onChange={(e) => updateSetting("aggregation", e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
              >
                {aggregations.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Data format
                </label>
                <select
                  value={settings.dataFormat || "Number"}
                  onChange={(e) => updateSetting("dataFormat", e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                >
                  {dataFormats.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Decimal precision
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.decimalPrecision ?? 0}
                  onChange={(e) =>
                    updateSetting(
                      "decimalPrecision",
                      Math.max(0, Number(e.target.value) || 0)
                    )
                  }
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                />
              </div>
            </div>
          </section>
        )}

        {/* Cartesian Charts: bar, line, area, scatter */}
        {["bar", "line", "area", "scatter"].includes(type) && (
          <section className="space-y-2 border-t border-slate-800 pt-3">
            <p className="text-[11px] font-semibold text-slate-200">
              Chart data
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  X-axis
                </label>
                <select
                  value={settings.xField || "product"}
                  onChange={(e) => updateSetting("xField", e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                >
                  {cartesianDimensions.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Y-axis
                </label>
                <select
                  value={settings.yField || "totalAmount"}
                  onChange={(e) => updateSetting("yField", e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                >
                  {numericMetrics.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Chart color
                </label>
                <input
                  type="text"
                  value={settings.chartColor || "#22c55e"}
                  onChange={(e) => updateSetting("chartColor", e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                  placeholder="#22c55e"
                />
              </div>
              <div className="flex items-center mt-5">
                <input
                  id="showLegend"
                  type="checkbox"
                  checked={!!settings.showLegend}
                  onChange={(e) =>
                    updateSetting("showLegend", e.target.checked)
                  }
                  className="mr-2 h-3 w-3 rounded border-slate-600 bg-slate-900"
                />
                <label htmlFor="showLegend" className="text-xs text-slate-200">
                  Show legend
                </label>
              </div>
            </div>
          </section>
        )}

        {/* Pie chart */}
        {type === "pie" && (
          <section className="space-y-2 border-t border-slate-800 pt-3">
            <p className="text-[11px] font-semibold text-slate-200">
              Pie chart data
            </p>

            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Group by
              </label>
              <select
                value={settings.chartDataField || "status"}
                onChange={(e) =>
                  updateSetting("chartDataField", e.target.value)
                }
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
              >
                {pieDimensions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center mt-1">
              <input
                id="pieLegend"
                type="checkbox"
                checked={!!settings.showLegend}
                onChange={(e) => updateSetting("showLegend", e.target.checked)}
                className="mr-2 h-3 w-3 rounded border-slate-600 bg-slate-900"
              />
              <label htmlFor="pieLegend" className="text-xs text-slate-200">
                Show legend
              </label>
            </div>
          </section>
        )}

        {/* Table settings */}
        {type === "table" && (
          <section className="space-y-2 border-t border-slate-800 pt-3">
            <p className="text-[11px] font-semibold text-slate-200">
              Table configuration
            </p>

            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Columns
              </label>
              <div className="grid grid-cols-2 gap-1 max-h-40 overflow-auto">
                {tableColumns.map((col) => (
                  <label
                    key={col.value}
                    className="flex items-center gap-1 text-[11px] text-slate-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col.value)}
                      onChange={() => toggleColumn(col.value)}
                      className="h-3 w-3 rounded border-slate-600 bg-slate-900"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Font size
                </label>
                <input
                  type="number"
                  min={12}
                  max={18}
                  value={settings.fontSize ?? 14}
                  onChange={(e) =>
                    updateSetting(
                      "fontSize",
                      Math.min(18, Math.max(12, Number(e.target.value) || 14))
                    )
                  }
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Header background
                </label>
                <input
                  type="text"
                  value={settings.headerBackground || "#54bd95"}
                  onChange={(e) =>
                    updateSetting("headerBackground", e.target.value)
                  }
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                  placeholder="#54bd95"
                />
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer buttons */}
      <div className="border-t border-slate-800 px-4 py-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary text-xs px-3 py-1.5 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary text-xs px-3 py-1.5 cursor-pointer"
        >
          Add
        </button>
      </div>
    </form>
  );
};

export default WidgetSettingsPanel;
