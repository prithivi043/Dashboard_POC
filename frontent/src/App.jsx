// App.jsx
import React, { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Table, Calendar, ChevronDown } from "lucide-react";

import Layout from "./components/Layout.jsx";
import DashboardView from "./components/DashboardView.jsx";
import OrdersTable from "./components/OrdersTable.jsx";
import ExcelUpload from "./components/ExcelUpload.jsx";
import DashboardConfigPage from "./pages/DashboardConfigPage.jsx"; // wrapper

const LOCAL_STORAGE_KEY_ORDERS = "dashboard_orders";
const LOCAL_STORAGE_KEY_WIDGETS = "dashboard_widgets";
const LOCAL_STORAGE_KEY_VIEW = "dashboard_view"; // persist current page

const App = () => {
  // Start with no sample data. Orders will come from uploaded Excel or localStorage.
  const [orders, setOrders] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [view, _setView] = useState("dashboard"); // internal setter
  const [isUploading, setIsUploading] = useState(false);
  const [dateRange, setDateRange] = useState("all");
  const dropdownRef = useRef(null);

  const options = [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "last7", label: "Last 7 days" },
    { value: "last30", label: "Last 30 days" },
    { value: "last90", label: "Last 90 days" },
  ];

  const [open, setOpen] = useState(false);

  const isConfig = view === "config";

  // Helper: set view + persist to localStorage
  const setViewAndPersist = (nextView) => {
    _setView(nextView);
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY_VIEW, nextView);
    } catch (e) {
      console.error("Failed to persist view to localStorage:", e);
    }
  };

  // Restore orders, widgets and view from localStorage on initial load
  useEffect(() => {
    try {
      const storedOrders = window.localStorage.getItem(
        LOCAL_STORAGE_KEY_ORDERS
      );
      const storedWidgets = window.localStorage.getItem(
        LOCAL_STORAGE_KEY_WIDGETS
      );
      const storedView = window.localStorage.getItem(LOCAL_STORAGE_KEY_VIEW);

      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
          setOrders(parsedOrders);
        }
      }

      if (storedWidgets) {
        const parsedWidgets = JSON.parse(storedWidgets);
        if (Array.isArray(parsedWidgets)) {
          setWidgets(parsedWidgets);
        }
      }

      if (storedView && ["dashboard", "table", "config"].includes(storedView)) {
        _setView(storedView);
      }
    } catch (e) {
      console.error("Failed to restore state from localStorage:", e);
    }
  }, []);

  // Helper: detect numeric vs string columns from Excel rows
  const detectColumns = (rows) => {
    if (!rows.length) return { numericKeys: [], stringKeys: [] };

    const sample = rows[0];
    const keys = Object.keys(sample || {});
    const numericKeys = [];
    const stringKeys = [];

    keys.forEach((k) => {
      const v = sample[k];
      if (v === null || v === undefined || v === "") return;
      const num = Number(v);
      if (!Number.isNaN(num)) numericKeys.push(k);
      else stringKeys.push(k);
    });

    return { numericKeys, stringKeys };
  };

  // Excel upload handler
  const handleExcelDataParsed = (excelData) => {
    if (!excelData || !excelData.workbookMeta?.sheetNames?.length) {
      console.warn("Excel upload: no sheet names found.");
      return;
    }

    const sheetNames = excelData.workbookMeta.sheetNames;
    const sheets = excelData.sheets || {};

    // 1) Find first sheet with data
    let rows = [];
    let usedSheetName = null;

    for (const name of sheetNames) {
      const candidate = sheets[name] || [];
      if (candidate.length > 0) {
        rows = candidate;
        usedSheetName = name;
        break;
      }
    }

    if (!rows.length) {
      console.warn("Excel upload: no rows found in any sheet.");
      alert(
        "The uploaded Excel file does not contain any data rows. Please check your file."
      );
      return;
    }

    console.log("[Excel upload] Using sheet:", usedSheetName);
    console.log("[Excel upload] First row keys:", Object.keys(rows[0] || {}));

    // 2) Detect columns for mapping
    const { numericKeys, stringKeys } = detectColumns(rows);
    const keys = Object.keys(rows[0] || {});

    let categoryKey =
      keys.find((k) =>
        [
          "product",
          "service",
          "category",
          "department",
          "team",
          "role",
          "name",
        ].includes(k.toLowerCase())
      ) || stringKeys[0];

    let valueKey =
      keys.find((k) =>
        [
          "total amount",
          "totalamount",
          "amount",
          "value",
          "revenue",
          "salary",
          "price",
          "cost",
        ].includes(k.toLowerCase())
      ) || numericKeys[0];

    let quantityKey =
      keys.find((k) =>
        ["quantity", "qty", "count", "headcount", "no of items"].includes(
          k.toLowerCase()
        )
      ) || null;

    console.log("[Excel mapping] categoryKey:", categoryKey);
    console.log("[Excel mapping] valueKey:", valueKey);
    console.log("[Excel mapping] quantityKey:", quantityKey);

    // 3) Map into internal order structure
    const mappedOrders = rows.map((row, index) => ({
      id:
        row["Order ID"] ||
        row["Order Id"] ||
        row["ID"] ||
        row["Id"] ||
        row["Employee ID"] ||
        row["Employee Id"] ||
        `ROW-${index + 1}`,
      firstName:
        row["First name"] || row["First Name"] || row["FirstName"] || "",
      lastName: row["Last name"] || row["Last Name"] || row["LastName"] || "",
      emailId: row["Email id"] || row["Email"] || row["EmailId"] || "",
      phoneNumber: row["Phone number"] || row["Phone"] || "",
      streetAddress: row["Street Address"] || row["Address"] || "",
      city: row["City"] || "",
      state: row["State / Province"] || row["State"] || "",
      postalCode: row["Postal code"] || row["PostalCode"] || "",
      country: row["Country"] || "",
      product: row["Product"] || (categoryKey ? row[categoryKey] : "") || "",
      quantity: Number(
        row["Quantity"] ??
          row["Qty"] ??
          (quantityKey ? row[quantityKey] : 1) ??
          1
      ),
      unitPrice: Number(row["Unit price"] ?? row["UnitPrice"] ?? 0),
      totalAmount: Number(
        row["Total amount"] ??
          row["TotalAmount"] ??
          (valueKey ? row[valueKey] : 0) ??
          0
      ),
      status:
        row["Status"] ||
        row["State"] ||
        row["Stage"] ||
        row["EmploymentStatus"] ||
        row["Employment Status"] ||
        "",
      createdBy: row["Created by"] || row["Owner"] || row["Manager"] || "",
      orderDate:
        row["Order date"] ||
        row["Order Date"] ||
        row["OrderDate"] ||
        row["Date"] ||
        row["JoinDate"] ||
        "",
    }));

    const anyMappedWithData = mappedOrders.some(
      (o) =>
        o.product ||
        o.totalAmount ||
        o.quantity ||
        o.status ||
        o.createdBy ||
        o.orderDate
    );

    if (!anyMappedWithData) {
      console.warn(
        "Excel upload: mappedOrders has no recognizable fields.",
        mappedOrders[0]
      );
      alert(
        "Your Excel header names do not match any usable fields.\n\n" +
          "At least one text column (for category) and one numeric column (for values) are required.\n" +
          "Check the browser console to see the detected headers and adjust mapping if needed."
      );
      return;
    }

    // 4) Save data to shared state
    setOrders(mappedOrders);
    setWidgets([]); // reset widgets for new dataset

    // 5) Persist orders + reset widgets in localStorage
    try {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY_ORDERS,
        JSON.stringify(mappedOrders)
      );
      window.localStorage.removeItem(LOCAL_STORAGE_KEY_WIDGETS);
    } catch (e) {
      console.error("Failed to persist orders to localStorage:", e);
    }

    // 6) Show loading animation, then go to Configure Dashboard
    setIsUploading(true);

    setTimeout(() => {
      setIsUploading(false);
      setViewAndPersist("config");
    }, 2000);
  };

  return (
    <Layout>
      {/* Global loading overlay for Excel upload */}
      {isUploading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
          role="status"
          aria-label="Preparing dashboard"
        >
          <div className="relative flex flex-col items-center gap-5 rounded-2xl bg-white px-10 py-8 shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
            {/* Spinner */}
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#54BD95] animate-spin" />
            </div>

            {/* Text */}
            <div className="text-center space-y-1">
              <p className="text-[15px] font-semibold text-slate-900">
                Preparing your dashboard
              </p>
              <p className="text-[13px] text-slate-500 max-w-xs">
                We’re processing your data and configuring analytics.
              </p>
            </div>

            {/* Progress shimmer */}
            <div className="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-1/3 animate-loading-bar rounded-full bg-[#54BD95]" />
            </div>
          </div>

          <style>{`
      @keyframes loading-bar {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(30%); }
        100% { transform: translateX(130%); }
      }
      .animate-loading-bar {
        animation: loading-bar 1.4s ease-in-out infinite;
      }
    `}</style>
        </div>
      )}

      {/* HEADER for Dashboard / Table */}
      {!isConfig && (
        <header className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[24px] font-semibold text-slate-900">
                Customer Orders
              </h1>
              <p className="text-sm text-slate-500">
                View and manage customer orders and details
              </p>
            </div>

            {/* Right section: Configure button + filter */}
            <div className="flex flex-col sm:items-end">
              <button
                onClick={() => setViewAndPersist("config")}
                type="button"
                className="inline-flex items-center justify-center rounded-md px-3 py-2 border border-emerald-400 bg-white text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                aria-label="Open dashboard configuration"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: 8 }}
                >
                  <path
                    d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"
                    stroke="#15803D"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.67 0 1.26-.38 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 6.8 3.8l.06.06c.46.46 1.12.66 1.7.48.58-.18 1.02-.68 1.02-1.29V3a2 2 0 0 1 4 0v.09c0 .61.44 1.11 1.02 1.29.58-.18 1.24-.02 1.7-.48l.06-.06A2 2 0 0 1 20.2 6.8l-.06.06c-.46.46-.66 1.12-.48 1.7.18.58.68 1.02 1.29 1.02H21a2 2 0 0 1 0 4h-.09c-.61 0-1.11.44-1.29 1.02-.18.58.02 1.24.48 1.7l.06.06A2 2 0 0 1 19.4 15z"
                    stroke="#15803D"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Configure dashboard
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex gap-6">
              {/* Dashboard label */}
              <button
                onClick={() => setViewAndPersist("dashboard")}
                aria-pressed={view === "dashboard"}
                className="flex flex-col items-center group focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard
                    size={18}
                    strokeWidth={2}
                    className={`transition-colors duration-300 ${
                      view === "dashboard" ? "text-[#54BD95]" : "text-slate-600"
                    }`}
                  />
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      view === "dashboard"
                        ? "text-[#54BD95] font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    Dashboard
                  </span>
                </div>

                <div
                  className={`mt-2 h-[3px] w-full bg-[#54BD95] rounded origin-left transform transition-transform duration-300 ease-out ${
                    view === "dashboard" ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>

              {/* Table label */}
              <button
                onClick={() => setViewAndPersist("table")}
                aria-pressed={view === "table"}
                className="flex flex-col items-center group focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Table
                    size={18}
                    strokeWidth={2}
                    className={`transition-colors duration-300 ${
                      view === "table" ? "text-[#54BD95]" : "text-slate-600"
                    }`}
                  />
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      view === "table"
                        ? "text-[#54BD95] font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    Table
                  </span>
                </div>

                <div
                  className={`mt-2 h-[3px] w-full bg-[#54BD95] rounded origin-left transform transition-transform duration-300 ease-out ${
                    view === "table" ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Filter under button */}
            <div className="relative flex items-center gap-3 text-xs justify-end ml-3">
              {/* Calendar Icon Trigger */}
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="p-1 rounded-md hover:bg-slate-100 transition"
              >
                <Calendar size={22} color="#727272" strokeWidth={2} />
              </button>

              {/* Custom Dropdown Button */}
              <button
                onClick={() => setOpen(!open)}
                className="
      bg-white border border-[#D0D0D0] rounded-lg px-3 py-2
      text-xs text-[#727272] flex items-center gap-2 cursor-pointer
      hover:border-[#9ECFBF] focus:border-[#54BD95] focus:ring-2
      focus:ring-[#C9E8DD] transition-all shadow-sm
    "
              >
                {options.find((o) => o.value === dateRange)?.label}
                <ChevronDown size={16} color="#727272" />
              </button>

              {/* Dropdown Menu */}
              {open && (
                <div
                  ref={dropdownRef}
                  className="
        absolute right-0 top-12 w-40 bg-white border border-[#D0D0D0]
        rounded-lg shadow-lg z-50 py-2 animate-fadeIn
      "
                >
                  {options.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setDateRange(opt.value);
                        setOpen(false);
                      }}
                      className="
            px-3 py-2 text-xs text-[#727272] cursor-pointer 
            hover:bg-[#F4F4F4] transition
          "
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* HEADER for Configure Dashboard */}
      {isConfig && (
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-start gap-4">
            {/* LEFT SIDE: Back Arrow */}
            <button
              onClick={() => setViewAndPersist("dashboard")}
              className="flex items-center justify-center h-8 w-8 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            {/* VERTICAL LINE */}
            <div className="h-10 w-px bg-slate-300"></div>

            {/* RIGHT SIDE: Title + Description */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Configure dashboard
              </h2>

              <p className="text-sm text-slate-500">
                Configure your dashboard to start viewing analytics
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewAndPersist("dashboard")}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </header>
      )}

      {/* Excel upload strip – only on Dashboard (no upload on Table or Config) */}
      {view === "dashboard" && (
        <div className="mb-4">
          <ExcelUpload onDataParsed={handleExcelDataParsed} />
        </div>
      )}

      {/* Views */}
      {view === "dashboard" && (
        <DashboardView
          orders={orders}
          widgets={widgets}
          onConfigure={() => setViewAndPersist("config")}
          dateRange={dateRange}
        />
      )}

      {view === "table" && <OrdersTable orders={orders} />}

      {view === "config" && (
        <DashboardConfigPage
          orders={orders}
          setOrders={setOrders}
          widgets={widgets}
          setWidgets={setWidgets}
          onClose={() => setViewAndPersist("dashboard")}
        />
      )}
    </Layout>
  );
};

export default App;
