import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const DEFAULT_COLOR = "#22c55e";

const formatNumber = (value, format, decimals = 0) => {
  if (value == null || isNaN(value)) return "-";
  const num = Number(value);
  if (format === "Currency") {
    return `$${num.toFixed(decimals)}`;
  }
  return num.toFixed(decimals);
};

const WidgetRenderer = ({ widget, orders }) => {
  if (!widget) return null;
  const { type, title, settings = {} } = widget;
  const color = settings.chartColor || DEFAULT_COLOR;

  const kpiValue = useMemo(() => {
    if (type !== "kpi" || !orders?.length) return null;
    const metric = settings.metric || "totalAmount";
    const aggregation = settings.aggregation || "Sum";
    const vals = orders
      .map((o) => Number(o[metric]))
      .filter((v) => !isNaN(v));

    if (aggregation === "Count") {
      return vals.length || orders.length;
    }
    if (!vals.length) return 0;

    const sum = vals.reduce((a, b) => a + b, 0);
    if (aggregation === "Average") return sum / vals.length;
    return sum;
  }, [type, orders, settings.metric, settings.aggregation]);

  const cartesianData = useMemo(() => {
    if (!["bar", "line", "area", "scatter"].includes(type) || !orders?.length)
      return [];

    const xField = settings.xField || "product";
    const yField = settings.yField || "totalAmount";

    const map = new Map();
    for (const o of orders) {
      const x = o[xField] ?? "Unknown";
      const y = Number(o[yField]);
      if (isNaN(y)) continue;
      map.set(x, (map.get(x) || 0) + y);
    }

    const arr = Array.from(map.entries()).map(([x, y]) => ({ x, y }));
    if (type === "scatter") {
      return arr.map((item, index) => ({ ...item, xi: index + 1 }));
    }
    return arr;
  }, [type, orders, settings.xField, settings.yField]);

  const pieData = useMemo(() => {
    if (type !== "pie" || !orders?.length) return [];
    const field = settings.chartDataField || "status";
    const map = new Map();
    for (const o of orders) {
      const key = o[field] ?? "Unknown";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [type, orders, settings.chartDataField]);

  const tableConfig = useMemo(() => {
    if (type !== "table") return null;
    const cols = settings.columns || [
      "firstName",
      "lastName",
      "product",
      "status",
      "totalAmount"
    ];
    return {
      columns: cols,
      fontSize: settings.fontSize || 14,
      headerBackground: settings.headerBackground || "#54bd95"
    };
  }, [type, settings.columns, settings.fontSize, settings.headerBackground]);

  const renderTitle = () => (
    <div className="mb-1 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900 truncate">
        {title || "Untitled"}
      </h3>
    </div>
  );

  if (type === "kpi") {
    const display = formatNumber(
      kpiValue,
      settings.dataFormat || "Number",
      settings.decimalPrecision ?? 0
    );
    const metricLabel =
      settings.metric === "quantity"
        ? "Quantity"
        : settings.metric === "unitPrice"
        ? "Unit price"
        : "Total amount";

    return (
      <div className="flex h-full flex-col justify-between">
        {renderTitle()}
        <div className="mt-1 flex flex-col gap-1">
          <div className="text-xs text-slate-500">{metricLabel}</div>
          <div className="text-2xl font-semibold text-slate-900">
            {display}
          </div>
          <div className="text-[11px] text-slate-400">
            {settings.aggregation || "Sum"}
          </div>
        </div>
      </div>
    );
  }

  if (["bar", "line", "area", "scatter"].includes(type)) {
    return (
      <div className="h-full flex flex-col">
        {renderTitle()}
        <div className="mt-2 flex-1">
          {cartesianData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {type === "bar" && (
                <BarChart data={cartesianData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  {settings.showLegend && <Legend />}
                  <Bar dataKey="y" fill={color} />
                </BarChart>
              )}
              {type === "line" && (
                <LineChart data={cartesianData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  {settings.showLegend && <Legend />}
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              )}
              {type === "area" && (
                <AreaChart data={cartesianData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  {settings.showLegend && <Legend />}
                  <Area
                    type="monotone"
                    dataKey="y"
                    stroke={color}
                    fill={color + "33"}
                  />
                </AreaChart>
              )}
              {type === "scatter" && (
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="xi" name="Index" />
                  <YAxis dataKey="y" name={settings.yField || "value"} />
                  <Tooltip />
                  {settings.showLegend && <Legend />}
                  <Scatter data={cartesianData} fill={color} />
                </ScatterChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  if (type === "pie") {
    const pieColors = ["#22c55e", "#0ea5e9", "#f97316", "#6366f1"];
    return (
      <div className="h-full flex flex-col">
        {renderTitle()}
        <div className="mt-2 flex-1">
          {pieData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                {settings.showLegend && <Legend />}
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius="80%"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  if (type === "table") {
    const cfg = tableConfig;
    const cols = cfg?.columns || [];
    const fontSize = cfg?.fontSize || 14;
    const headerBg = cfg?.headerBackground || "#54bd95";

    const labelMap = {
      firstName: "First name",
      lastName: "Last name",
      emailId: "Email id",
      phoneNumber: "Phone number",
      streetAddress: "Address",
      product: "Category / Product",
      quantity: "Quantity",
      unitPrice: "Unit price",
      totalAmount: "Total amount",
      status: "Status",
      createdBy: "Created by",
      orderDate: "Order date"
    };

    return (
      <div className="h-full flex flex-col">
        {renderTitle()}
        <div className="mt-2 flex-1 overflow-auto">
          <table
            className="w-full border-collapse"
            style={{ fontSize: `${fontSize}px` }}
          >
            <thead>
              <tr style={{ backgroundColor: headerBg, color: "#ffffff" }}>
                {cols.map((c) => (
                  <th key={c} className="px-2 py-1 text-left font-medium">
                    {labelMap[c] || c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={cols.length || 1}
                    className="px-2 py-3 text-center text-slate-400"
                  >
                    No data available.
                  </td>
                </tr>
              ) : (
                orders.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    {cols.map((c) => (
                      <td key={c} className="px-2 py-1 text-slate-700">
                        {c === "totalAmount" || c === "unitPrice"
                          ? formatNumber(row[c], "Currency", 2)
                          : c === "orderDate" && row[c]
                          ? new Date(row[c]).toLocaleDateString()
                          : row[c] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-xs text-slate-400">
      Unsupported widget type.
    </div>
  );
};

export default WidgetRenderer;
