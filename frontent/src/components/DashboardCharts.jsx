import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const DashboardCharts = ({ orders }) => {
  // Revenue by Product (Bar chart)
  const revenueByProduct = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const key = o.product;
      map.set(key, (map.get(key) || 0) + o.totalAmount);
    });
    return Array.from(map.entries()).map(([product, revenue]) => ({
      product,
      revenue: Number(revenue.toFixed(2)),
    }));
  }, [orders]);

  // Revenue over Time (Line chart) – grouped by date
  const revenueByDay = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const day = new Date(o.orderDate).toISOString().slice(0, 10);
      map.set(day, (map.get(day) || 0) + o.totalAmount);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, revenue]) => ({
        date,
        revenue: Number(revenue.toFixed(2)),
      }));
  }, [orders]);

  // Orders by Status (Pie chart)
  const ordersByStatus = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const key = o.status;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  }, [orders]);

  const pieColors = ["#22c55e", "#0ea5e9", "#f97316", "#6366f1"];

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr,1.3fr]">
      {/* Left column: Bar + Line stacked vertically */}
      <div className="space-y-4">
        {/* Bar chart – Revenue by Product */}
        <div className="card p-4 h-64">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Revenue by product
            </h3>
            <p className="text-xs text-slate-400">Bar chart</p>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByProduct}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart – Revenue over time */}
        <div className="card p-4 h-64">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Revenue trend
            </h3>
            <p className="text-xs text-slate-400">Line chart</p>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right column: Pie chart card */}
      <div className="card p-4 h-[528px] flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Orders by status
          </h3>
          <p className="text-xs text-slate-400">Pie chart</p>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={ordersByStatus}
                dataKey="count"
                nameKey="status"
                outerRadius="80%"
                label
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
