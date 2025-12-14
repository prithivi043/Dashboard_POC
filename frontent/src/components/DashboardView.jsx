// DashboardView.jsx
import React, { useMemo, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import WidgetRenderer from "./WidgetRenderer.jsx";

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardView = ({ orders, widgets, onConfigure, dateRange }) => {
  const filteredOrders = useMemo(() => {
    if (dateRange === "all") return orders;
    const now = new Date();
    let from = null;
    if (dateRange === "today") {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      from = d;
    } else if (dateRange === "last7") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "last30") {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "last90") {
      from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }
    if (!from) return orders;
    return orders.filter((o) => new Date(o.orderDate) >= from);
  }, [orders, dateRange]);

  // ---- Summary stats for top widgets ----
  const stats = useMemo(() => {
    const totalRecords = filteredOrders?.length || 0;

    if (totalRecords === 0) {
      return {
        totalRecords: 0,
        totalValue: 0,
        avgValue: 0,
        completionRate: null,
      };
    }

    const sample = filteredOrders[0] || {};

    // Try to infer the main numeric metric for "Total Value"
    const numericKeys = Object.keys(sample).filter(
      (key) => typeof sample[key] === "number"
    );

    let mainMetricKey = null;
    if (numericKeys.includes("totalAmount")) mainMetricKey = "totalAmount";
    else if (numericKeys.includes("totalValue")) mainMetricKey = "totalValue";
    else if (numericKeys.includes("amount")) mainMetricKey = "amount";
    else if (numericKeys.includes("value")) mainMetricKey = "value";
    else mainMetricKey = numericKeys[0] || null;

    let totalValue = 0;
    if (mainMetricKey) {
      totalValue = filteredOrders.reduce((sum, order) => {
        const val = order[mainMetricKey];
        return typeof val === "number" ? sum + val : sum;
      }, 0);
    }

    const avgValue =
      totalRecords > 0 && totalValue ? totalValue / totalRecords : 0;

    // Completion rate (if status is available)
    const statusKey =
      "status" in sample
        ? "status"
        : "orderStatus" in sample
        ? "orderStatus"
        : null;

    let completionRate = null;
    if (statusKey) {
      const completedStatuses = [
        "complete",
        "completed",
        "delivered",
        "closed",
        "done",
      ];
      const completedCount = filteredOrders.reduce((count, order) => {
        const raw = String(order[statusKey] || "").toLowerCase();
        return completedStatuses.includes(raw) ? count + 1 : count;
      }, 0);

      completionRate =
        totalRecords > 0 ? (completedCount / totalRecords) * 100 : 0;
    }

    return {
      totalRecords,
      totalValue,
      avgValue,
      completionRate,
    };
  }, [filteredOrders]);

  if (!widgets || widgets.length === 0) {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-4">
        {/* Dashboard icon (centered) */}
        <div
          aria-hidden="true"
          className="flex items-center justify-center"
          style={{ width: 56, height: 56 }}
        >
          {/* Simple dashboard/grid SVG icon */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="2"
              y="3"
              width="9"
              height="8"
              rx="1"
              stroke="#94A3B8"
              strokeWidth="1.5"
              fill="#F8FAFC"
            />
            <rect
              x="13"
              y="3"
              width="9"
              height="5"
              rx="1"
              stroke="#94A3B8"
              strokeWidth="1.5"
              fill="#F8FAFC"
            />
            <rect
              x="13"
              y="10"
              width="9"
              height="11"
              rx="1"
              stroke="#94A3B8"
              strokeWidth="1.5"
              fill="#F8FAFC"
            />
            <rect
              x="2"
              y="12"
              width="9"
              height="9"
              rx="1"
              stroke="#94A3B8"
              strokeWidth="1.5"
              fill="#F8FAFC"
            />
          </svg>
        </div>

        {/* Heading: Dashboard Not Configured */}
        <h2 className="font-quicksand font-medium text-[16px] leading-6 text-center tracking-[0px] m-0 text-slate-900">
          Dashboard Not Configured
        </h2>

        {/* Subtext: Configure your dashboard to start viewing analytics */}
        <p
          style={{
            fontFamily: "Open Sans, system-ui, sans-serif",
            fontWeight: 400,
            fontStyle: "Regular",
            fontSize: "12px",
            lineHeight: "12px", // approximates 100%
            textAlign: "center",
            letterSpacing: "0px",
            color: "rgb(100,116,139)", // slate-500
            margin: 0,
            maxWidth: 360,
          }}
        >
          Configure your dashboard to start viewing analytics
        </p>

        {/* Configure button with right-side settings icon */}
        <div className="mt-4">
          <button
            onClick={onConfigure}
            type="button"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-transparent"
            style={{
              border: "1px solid #54BD95",
              fontFamily: "Open Sans, system-ui, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "14px",
              color: "#54BD95",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            aria-label="Configure dashboard"
          >
            {" "}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "inline-block" }}
            >
              <path
                d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"
                stroke="#54BD95"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.67 0 1.26-.38 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 6.8 3.8l.06.06c.46.46 1.12.66 1.7.48.58-.18 1.02-.68 1.02-1.29V3a2 2 0 0 1 4 0v.09c0 .61.44 1.11 1.02 1.29.58.18 1.24-.02 1.7-.48l.06-.06A2 2 0 0 1 20.2 6.8l-.06.06c-.46.46-.66 1.12-.48 1.7.18.58.68 1.02 1.29 1.02H21a2 2 0 0 1 0 4h-.09c-.61 0-1.11.44-1.29 1.02-.18.58.02 1.24.48 1.7l.06.06A2 2 0 0 1 19.4 15z"
                stroke="#54BD95"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{ marginRight: 8, paddingLeft: "6px", cursor: "pointer" }}
            >
              Configure dashboard
            </span>
            {/* Gear icon with color #54BD95 */}
          </button>
        </div>
      </div>
    );
  }

  const layouts = {
    lg: widgets.map((w, idx) => ({
      i: w.widgetId,
      x: w.layout?.x ?? (idx * 4) % 12,
      y: w.layout?.y ?? Infinity,
      w: w.layout?.w ?? 4,
      h: w.layout?.h ?? 4,
    })),
  };

  return (
    <div className="space-y-4">
      {/* Filter row */}
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Show data for</span>
          <select
            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 90 days</option>
          </select>
        </div>
      </div> */}

      {/* Top summary widgets */}
      <section className="flex-1 flex flex-col space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Records */}
          <div className="card px-4 py-3 bg-white rounded-xl border border-slate-200">
            <p className="text-[12px] text-slate-500 mb-1">Total Records</p>
            <p className="text-xl font-semibold text-slate-900">
              {stats.totalRecords.toLocaleString()}
            </p>
          </div>

          {/* Total Value */}
          <div className="card px-4 py-3 bg-white rounded-xl border border-slate-200">
            <p className="text-[12px] text-slate-500 mb-1">Total Value</p>
            <p className="text-xl font-semibold text-slate-900">
              {stats.totalValue
                ? stats.totalValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                : "0"}
            </p>
          </div>

          {/* Average Value per Record */}
          <div className="card px-4 py-3 bg-white rounded-xl border border-slate-200">
            <p className="text-[12px] text-slate-500 mb-1">
              Average Value per Record
            </p>
            <p className="text-xl font-semibold text-slate-900">
              {stats.avgValue
                ? stats.avgValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                : "0"}
            </p>
          </div>

          {/* Completion Rate */}
          <div className="card px-4 py-3 bg-white rounded-xl border border-slate-200">
            <p className="text-[12px] text-slate-500 mb-1">Completion Rate</p>
            <p className="text-xl font-semibold text-slate-900">
              {stats.completionRate === null
                ? "—"
                : `${stats.completionRate.toFixed(1)}%`}
            </p>
          </div>
        </div>
      </section>

      {/* Existing diagram / widgets area — unchanged behavior */}
      <div className="card p-4">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          isDraggable={false}
          isResizable={false}
          rowHeight={60}
          cols={{ lg: 12, md: 8, sm: 4, xs: 4, xxs: 4 }}
          breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 }}
          margin={[16, 16]}
          useCSSTransforms
        >
          {widgets.map((widget) => (
            <div
              key={widget.widgetId}
              className="bg-white rounded-xl border border-slate-200 p-3"
            >
              <WidgetRenderer widget={widget} orders={filteredOrders} />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default DashboardView;
