// DashboardConfig.jsx
import React, { useMemo, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { v4 as uuidv4 } from "uuid";
import WidgetRenderer from "./WidgetRenderer.jsx";
import WidgetSettingsPanel from "./WidgetSettingsPanel.jsx";
import DateFilter from "./DateFilter.jsx";

const ResponsiveGridLayout = WidthProvider(Responsive);

const IconWrapper = ({ children }) => (
  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 border border-emerald-100">
    {children}
  </span>
);

const BarIcon = () => (
  <IconWrapper>
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600">
      <rect x="3" y="10" width="3" height="11" rx="1" />
      <rect x="10.5" y="6" width="3" height="15" rx="1" />
      <rect x="18" y="3" width="3" height="18" rx="1" />
    </svg>
  </IconWrapper>
);

const LineIcon = () => (
  <IconWrapper>
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-emerald-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <polyline points="3,17 9,10 14,14 21,6" />
      <circle cx="3" cy="17" r="0.8" />
      <circle cx="9" cy="10" r="0.8" />
      <circle cx="14" cy="14" r="0.8" />
      <circle cx="21" cy="6" r="0.8" />
    </svg>
  </IconWrapper>
);

const PieIcon = () => (
  <IconWrapper>
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600">
      <path d="M12 3a9 9 0 0 1 8.66 6.5L12 10V3z" />
      <path d="M12 12v9A9 9 0 0 1 6 4.34L12 12z" />
      <path d="M10 3.05A9 9 0 0 0 4.05 10H10V3.05z" />
    </svg>
  </IconWrapper>
);

const AreaIcon = () => (
  <IconWrapper>
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-emerald-600"
      fill="currentColor"
    >
      <path d="M3 18V9l4 3 5-7 5 9 4-4v8H3z" />
    </svg>
  </IconWrapper>
);

const ScatterIcon = () => (
  <IconWrapper>
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600">
      <circle cx="5" cy="17" r="1.2" />
      <circle cx="9" cy="10" r="1.2" />
      <circle cx="15" cy="14" r="1.2" />
      <circle cx="19" cy="6" r="1.2" />
    </svg>
  </IconWrapper>
);

const TableIcon = () => (
  <IconWrapper>
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600">
      <rect x="3" y="4" width="18" height="3" rx="1" />
      <rect x="3" y="10.5" width="18" height="3" rx="1" />
      <rect x="3" y="17" width="18" height="3" rx="1" />
    </svg>
  </IconWrapper>
);

const KpiIcon = () => (
  <IconWrapper>
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-emerald-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8v4l3 2" />
    </svg>
  </IconWrapper>
);

const widgetPalette = [
  {
    label: "Bar Chart",
    operationTitle: "Monthly Revenue by Category",
    type: "bar",
    defaultSize: { w: 5, h: 5 },
    group: "Charts",
    icon: <BarIcon />,
    description: "Compare revenue across categories",
  },
  {
    label: "Line Chart",
    operationTitle: "Revenue Trend Over Time",
    type: "line",
    defaultSize: { w: 5, h: 5 },
    group: "Charts",
    icon: <LineIcon />,
    description: "Visualize growth trends",
  },
  {
    label: "Pie Chart",
    operationTitle: "Order Status Distribution",
    type: "pie",
    defaultSize: { w: 4, h: 4 },
    group: "Charts",
    icon: <PieIcon />,
    description: "Proportion of orders by status",
  },
  {
    label: "Area Chart",
    operationTitle: "Cumulative Revenue",
    type: "area",
    defaultSize: { w: 5, h: 5 },
    group: "Charts",
    icon: <AreaIcon />,
    description: "Highlight cumulative values",
  },
  {
    label: "Scatter Plot",
    operationTitle: "Quantity vs Value",
    type: "scatter",
    defaultSize: { w: 5, h: 5 },
    group: "Charts",
    icon: <ScatterIcon />,
    description: "Correlation between quantity & amount",
  },
  {
    label: "Table",
    operationTitle: "Customer Order Details",
    type: "table",
    defaultSize: { w: 4, h: 4 },
    group: "Tables",
    icon: <TableIcon />,
    description: "View detailed records",
  },
  {
    label: "KPI Value",
    operationTitle: "Pending Orders",
    type: "kpi",
    defaultSize: { w: 2, h: 2 },
    group: "KPIs",
    icon: <KpiIcon />,
    description: "Single key performance metric",
  },
];

const filterOrdersByDateRange = (orders, range) => {
  if (range === "all") return orders;

  const now = new Date();
  let start;

  switch (range) {
    case "today": {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    }
    case "last7": {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    }
    case "last30": {
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      break;
    }
    case "last90": {
      start = new Date(now);
      start.setDate(start.getDate() - 90);
      break;
    }
    default:
      return orders;
  }

  return orders.filter((o) => {
    if (!o.orderDate) return true;
    const d = new Date(o.orderDate);
    if (isNaN(d.getTime())) return true;
    return d >= start && d <= now;
  });
};

const DashboardConfig = ({
  orders = [],
  widgets = [],
  setWidgets,
  onDone,
  onSave,
}) => {
  const [toast, setToast] = useState(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [openGroups, setOpenGroups] = useState({
    Charts: true,
    Tables: true,
    KPIs: true,
  });

  const [dateFilter, setDateFilter] = useState("all");

  const filteredOrders = useMemo(
    () => filterOrdersByDateRange(orders, dateFilter),
    [orders, dateFilter]
  );

  const summary = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const completedCount = filteredOrders.filter(
      (o) => (o.status || "").toLowerCase() === "completed"
    ).length;
    const pendingCount = filteredOrders.filter(
      (o) => (o.status || "").toLowerCase() === "pending"
    ).length;
    const inProgressCount = filteredOrders.filter(
      (o) => (o.status || "").toLowerCase() === "in progress"
    ).length;
    const completionRate = totalOrders
      ? (completedCount / totalOrders) * 100
      : 0;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      completedCount,
      pendingCount,
      inProgressCount,
      completionRate,
    };
  }, [filteredOrders]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const onAddWidget = (paletteItem) => {
    const widgetId = uuidv4();

    // compute base x (simple left-most placement)
    const nextX = widgets.reduce(
      (maxX, w) => Math.max(maxX, (w.layout?.x || 0) + (w.layout?.w || 0)),
      0
    );
    const baseX = nextX >= 12 ? 0 : nextX;

    // compute max bottom row (y + h) among existing widgets so we place new widget below them
    const maxBottom = widgets.reduce((acc, w) => {
      const ly = typeof w.layout?.y === "number" ? w.layout.y : 0;
      const lh = typeof w.layout?.h === "number" ? w.layout.h : 4;
      return Math.max(acc, ly + lh);
    }, 0);

    const newWidget = {
      widgetId,
      type: paletteItem.type,
      title: paletteItem.operationTitle || paletteItem.label,
      description: "",
      layout: {
        x: baseX,
        // place below all existing widgets to avoid overlap
        y: maxBottom,
        w: paletteItem.defaultSize.w,
        h: paletteItem.defaultSize.h,
      },
      settings: {
        metric: "totalAmount",
        aggregation: "Sum",
        dataFormat: "Number",
        decimalPrecision: 0,
        xField: "product",
        yField: "totalAmount",
        chartDataField: "status",
        chartColor: "#22c55e",
        showLegend: true,
        columns: ["firstName", "lastName", "product", "status", "totalAmount"],
        fontSize: 14,
        headerBackground: "#54bd95",
      },
    };

    setWidgets([...widgets, newWidget]);
    setSelectedWidgetId(widgetId);
    showToast("All set! Your new widget has been added.");
  };

  const generateBaseLayout = (widgetsArr) =>
    widgetsArr.map((w, idx) => ({
      i: w.widgetId,
      x: typeof w.layout?.x === "number" ? w.layout.x : (idx * 4) % 12,
      y: typeof w.layout?.y === "number" ? w.layout.y : 0,
      w: typeof w.layout?.w === "number" ? w.layout.w : 4,
      h: typeof w.layout?.h === "number" ? w.layout.h : 4,
    }));

  const baseLayout = generateBaseLayout(widgets);

  const layouts = {
    lg: baseLayout,
    md: baseLayout,
    sm: baseLayout,
    xs: baseLayout,
    xxs: baseLayout,
  };

  const onLayoutChange = (currentLayout) => {
    const map = {};
    currentLayout.forEach((item) => {
      map[item.i] = item;
    });

    const updated = widgets.map((w) => {
      const l = map[w.widgetId];
      if (!l) return w;
      return {
        ...w,
        layout: { ...w.layout, x: l.x, y: l.y, w: l.w, h: l.h },
      };
    });

    setWidgets(updated);
  };

  const onDeleteWidget = (id) => {
    if (!window.confirm("Are you sure you want to delete this widget?")) return;
    const updated = widgets.filter((w) => w.widgetId !== id);
    setWidgets(updated);
    if (selectedWidgetId === id) setSelectedWidgetId(null);
    showToast("Done! The widget has been removed.");
  };

  const onApplyWidgetConfig = (updatedWidget) => {
    const up = widgets.map((w) =>
      w.widgetId === updatedWidget.widgetId
        ? {
            ...w,
            title: updatedWidget.title,
            description: updatedWidget.description,
            settings: updatedWidget.settings,
            layout: {
              ...w.layout,
              ...(updatedWidget.layout || {}),
            },
          }
        : w
    );
    setWidgets(up);
    setSelectedWidgetId(null);
    showToast("Widget configuration saved successfully.");
  };

  const onCancelWidgetConfig = () => setSelectedWidgetId(null);

  const groupedPalette = ["Charts", "Tables", "KPIs"].map((group) => ({
    group,
    items: widgetPalette.filter((w) => w.group === group),
  }));

  const toggleGroup = (g) =>
    setOpenGroups((prev) => ({ ...prev, [g]: !prev[g] }));

  const activeWidget = widgets.find((w) => w.widgetId === selectedWidgetId);

  const handleSaveClick = () => {
    if (onSave) onSave();
    else if (onDone) onDone();
  };

  const GRID_COLS = 12;
  const GRID_ROWS = 32;

  const backgroundCells = useMemo(() => {
    const occupied = new Set();

    widgets.forEach((w) => {
      const layout = w.layout || {};
      const startX = layout.x ?? 0;
      const startY = layout.y ?? 0;
      const width = layout.w ?? 4;
      const height = layout.h ?? 4;

      for (let row = startY; row < startY + height && row < GRID_ROWS; row++) {
        for (let col = startX; col < startX + width && col < GRID_COLS; col++) {
          occupied.add(`${row}-${col}`);
        }
      }
    });

    const freeCells = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const key = `${row}-${col}`;
        if (!occupied.has(key)) {
          freeCells.push({ row, col, key });
        }
      }
    }
    return freeCells;
  }, [widgets]);

  return (
    <div className="relative lg:mt-1 lg:h-[872px]">
      {toast && (
        <div className="fixed right-6 top-6 z-40 flex items-center gap-2 rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:h-full">
        <aside
          className="
            space-y-4
            w-full
            lg:w-[297px]
            lg:h-full
            lg:border-r lg:border-slate-200
            overflow-y-auto
          "
        >
          <div className="card p-4">
            <div className="flex flex-col gap-3">
              <DateFilter value={dateFilter} onChange={setDateFilter} />
            </div>
          </div>

          <div className="card p-4">
            <p className="mb-3 text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Widget library
            </p>

            <div className="space-y-3">
              {groupedPalette.map(({ group, items }) => (
                <div
                  key={group}
                  className="rounded-lg border border-slate-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-slate-800 bg-[#D4D4D426]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[16px] text-emerald-700 border border-emerald-100">
                        {group === "Charts"
                          ? "CH"
                          : group === "Tables"
                          ? "TB"
                          : "KPI"}
                      </span>
                      <span className="text-[16px]">{group}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {openGroups[group] ? "Hide" : "Show"}
                    </span>
                  </button>

                  {openGroups[group] && (
                    <div className="border-t border-slate-200">
                      {items.map((w) => (
                        <button
                          key={w.label}
                          type="button"
                          className="flex w-full items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-white"
                          onClick={() => onAddWidget(w)}
                        >
                          <span className="flex items-center gap-2">
                            {w.icon}
                            <span className="flex flex-col items-start">
                              <span className="font-medium text-[14px]">
                                {w.label}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {w.description}
                              </span>
                            </span>
                          </span>
                          <span className="text-[10px] rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-100">
                            Add
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              className="btn-secondary flex-1 text-sm"
              onClick={onDone}
            >
              Back
            </button>
            <button
              type="button"
              className="btn-primary flex-1 text-sm"
              onClick={handleSaveClick}
            >
              Save
            </button>
          </div>
        </aside>

        <section className="flex-1 lg:h-full flex flex-col space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card px-4 py-3 bg-white">
              <p className="text-[12px] text-slate-500">Total records</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {summary.totalOrders}
              </p>
            </div>

            <div className="card px-4 py-3 bg-white">
              <p className="text-[12px] text-slate-500">
                Total value (sum of main metric)
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                ${summary.totalRevenue.toFixed(2)}
              </p>
            </div>

            <div className="card px-4 py-3 bg-white">
              <p className="text-[12px] text-slate-500">
                Average value per record
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                ${summary.avgOrderValue.toFixed(2)}
              </p>
            </div>

            <div className="card px-4 py-3 bg-white">
              <p className="text-[12px] text-slate-500">
                Completion rate (if status available)
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {summary.completionRate.toFixed(1)}%
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Completed: {summary.completedCount} • Pending:{" "}
                {summary.pendingCount} • In progress: {summary.inProgressCount}
              </p>
            </div>
          </div>

          <div className="card bg-white p-4 flex-1 min-h-0 flex flex-col">
            {/* IMPORTANT: this container must be allowed to shrink (min-h-0)
                so the inner grid can overflow and scroll. */}
            <div className="relative h-full bg-white border border-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.06)] p-3 overflow-auto">
              {/* Background grid cells are always rendered */}
              <div className="absolute inset-3 grid grid-cols-12 auto-rows-[30px] gap-2 pointer-events-none z-0">
                {backgroundCells.map((cell) => (
                  <div
                    key={cell.key}
                    style={{
                      gridColumn: cell.col + 1,
                      gridRow: cell.row + 1,
                    }}
                    className="w-20 h-[30px] border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.08)] bg-[#EFEFEF]"
                  />
                ))}
              </div>

              {/* Grid layout is always rendered and never hidden.
                  Parent has overflow-auto so the grid can grow and be scrolled vertically. */}
              <ResponsiveGridLayout
                key={widgets.length} // force refresh when widget count changes
                className="layout relative z-10"
                layouts={layouts}
                cols={{ lg: 12, md: 8, sm: 4, xs: 4, xxs: 4 }}
                breakpoints={{
                  lg: 1024,
                  md: 768,
                  sm: 640,
                  xs: 480,
                  xxs: 0,
                }}
                rowHeight={60}
                margin={[12, 12]}
                onLayoutChange={onLayoutChange}
                isDraggable
                isResizable
                useCSSTransforms
                draggableCancel=".widget-action"
                compactType="vertical"
              >
                {widgets.map((widget) => (
                  <div
                    key={widget.widgetId}
                    data-grid={{
                      x: widget.layout?.x ?? 0,
                      y: widget.layout?.y ?? 0,
                      w: widget.layout?.w ?? 4,
                      h: widget.layout?.h ?? 4,
                      i: widget.widgetId,
                    }}
                    className={`relative rounded-xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-slate-200 group transition-shadow hover:shadow-md ${
                      selectedWidgetId === widget.widgetId
                        ? "ring-1 ring-emerald-500"
                        : ""
                    }`}
                  >
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWidgetId(widget.widgetId);
                        }}
                        className="widget-action rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                      >
                        Settings
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWidget(widget.widgetId);
                        }}
                        className="widget-action rounded-md bg-red-500 px-2 py-1 text-[11px] text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>

                    <div
                      className="h-full cursor-pointer p-3"
                      onClick={() => setSelectedWidgetId(widget.widgetId)}
                    >
                      <WidgetRenderer widget={widget} orders={filteredOrders} />
                    </div>
                  </div>
                ))}
              </ResponsiveGridLayout>
            </div>
          </div>
        </section>
      </div>

      {activeWidget && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full justify-end pointer-events-none">
          <div className="h-full w-full sm:w-1/2 lg:w-1/3 bg-slate-950 border-l border-slate-800 shadow-xl flex flex-col pointer-events-auto">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">
                Widget configuration
              </h3>
              <button
                type="button"
                onClick={onCancelWidgetConfig}
                className="text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>

            <WidgetSettingsPanel
              widget={activeWidget}
              onApply={onApplyWidgetConfig}
              onCancel={onCancelWidgetConfig}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardConfig;
