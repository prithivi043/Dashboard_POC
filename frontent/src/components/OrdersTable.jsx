// src/components/OrdersTable.jsx
import React, { useEffect, useState, useMemo } from "react";
import api from "../apiClient";
import DateFilter from "./DateFilter.jsx";
import OrderFormModal from "./OrderFormModal.jsx";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [dateRange, setDateRange] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // NEW: Global menu state (id + viewport position)
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Load ALL orders (no backend filtering)
  const load = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err, err?.response?.data);
      setLoadError(
        err?.response?.data?.message || "Failed to load orders from server."
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // FRONTEND FILTERING LOGIC
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // SEARCH FILTER (Customer Name)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((o) =>
        `${o.firstName} ${o.lastName}`.toLowerCase().includes(q)
      );
    }

    // DATE FILTER
    if (dateRange !== "all") {
      const now = new Date();
      let from = null;

      if (dateRange === "today") {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        from = d;
      } else if (dateRange === "last7") {
        from = new Date(now - 7 * 24 * 60 * 60 * 1000);
      } else if (dateRange === "last30") {
        from = new Date(now - 30 * 24 * 60 * 60 * 1000);
      } else if (dateRange === "last90") {
        from = new Date(now - 90 * 24 * 60 * 60 * 1000);
      }

      result = result.filter((o) => {
        if (!o.orderDate) return false;
        return new Date(o.orderDate) >= from;
      });
    }

    return result;
  }, [orders, dateRange, searchQuery]);

  // Toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const onCreate = () => {
    setEditingOrder(null);
    setModalOpen(true);
  };

  const onEdit = (order) => {
    setEditingOrder(order);
    setModalOpen(true);
  };

  const onAskDelete = (order) => {
    setConfirmDelete(order);
  };

  const onDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/orders/${confirmDelete._id}`);
      setConfirmDelete(null);
      await load();
      showToast("Done! Your Item has been removed");
    } catch (err) {
      console.error("Failed to delete order:", err);
      showToast("Failed to delete order from server.");
    }
  };

  const onSaved = async (mode, newOrder) => {
    setModalOpen(false);
    setEditingOrder(null);

    await load(); // reload updated list

    if (mode === "create") {
      // Determine descending order number
      const orderNumber = orders.length + 1;
      const orderId = `ORD - ${String(orderNumber).padStart(4, "0")}`;

      showToast(`Nice work! Your new order “${orderId}” is now in the list!`);
    } else {
      showToast("All set! Your changes have been saved successfully!");
    }
  };

  const stopProp = (e) => e.stopPropagation();

  // Kebab menu toggle – compute viewport coordinates and store them
  const toggleMenu = (e, orderId) => {
    e.stopPropagation();

    if (menuOpenId === orderId) {
      setMenuOpenId(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();

    setMenuOpenId(orderId);
    setMenuPosition({
      top: rect.bottom + window.scrollY + 6,
      left: rect.right + window.scrollX,
    });
  };

  const activeOrder = menuOpenId
    ? orders.find((o) => o._id === menuOpenId)
    : null;

  const hasOrders = filteredOrders.length > 0;

  return (
    <div className="relative space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-lg shadow"
          style={{
            backgroundColor: "#E1F2EB",
            padding: "10px 16px",
            fontSize: "14px",
            color: "#115E4C",
            borderRadius: "8px",
            maxWidth: "260px",
          }}
        >
          {toast}
        </div>
      )}

      {/* Load error */}
      {loadError && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {loadError}
        </div>
      )}

      {/* Filter + Create order */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <DateFilter value={dateRange} onChange={setDateRange} />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center">
            <div className="relative" style={{ width: "255px" }}>
              {/* Input */}
              <input
                type="text"
                placeholder="Search customer name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: "39px", fontSize: "14px" }}
                className="
        w-full rounded-full border border-slate-200 bg-white
        pl-4 pr-10
        text-[13px] text-slate-700
        placeholder:text-slate-400
        shadow-sm
        transition-all duration-200
        hover:border-slate-300
        focus:outline-none
        focus:border-emerald-500
        focus:ring-2 focus:ring-emerald-200
      "
              />

              {/* Search Icon (RIGHT SIDE) */}
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-slate-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
            </div>
          </div>

          <button
            onClick={onCreate}
            style={{ height: "39px", fontSize: "14px" }}
            className="
    inline-flex items-center gap-2
    rounded-full
    bg-emerald-600
    px-5
    text-[13px] font-medium text-white
    shadow-sm
    transition-all duration-200
    hover:bg-emerald-700
    focus:outline-none
    focus:ring-2 focus:ring-emerald-300
  "
          >
            {/* Plus Icon (FRONT) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>

            <span>Create order</span>
          </button>
        </div>
      </div>

      {/* Loading / Empty / Table */}
      {loading ? (
        <div className="card p-6 text-center text-sm text-slate-500">
          Loading orders...
        </div>
      ) : !hasOrders ? (
        <div className="card p-8 text-center space-y-2">
          <h2 className="text-base font-semibold text-slate-900">
            No Orders Yet
          </h2>
          <p className="text-sm text-slate-500">
            Click Create Order and enter your order information.
          </p>
          <button onClick={onCreate} className="btn-primary mt-3">
            Create order
          </button>
        </div>
      ) : (
        <div className="card overflow-auto">
          <table className="w-full text-left text-[14px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 font-medium text-slate-500">S.no</th>
                <th className="px-3 py-2 font-medium text-slate-500">
                  Customer ID
                </th>
                <th className="px-3 py-2 font-medium text-slate-500">
                  Customer name
                </th>
                <th className="px-3 py-2 font-medium text-slate-500">
                  Email id
                </th>
                <th className="px-3 py-2 font-medium text-slate-500">
                  Phone number
                </th>
                <th className="px-3 py-2 font-medium text-slate-500">
                  Address
                </th>
                <th className="px-3 py-2 font-medium text-slate-500">
                  Order ID
                </th>
                <th className="px-3 py-2 font-medium text-slate-500">
                  Order date
                </th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((o, idx) => {
                const reversedNumber = filteredOrders.length - idx;

                const customerId = `CUST-${String(reversedNumber).padStart(
                  4,
                  "0"
                )}`;
                const orderId = `ORD-${String(reversedNumber).padStart(
                  4,
                  "0"
                )}`;

                const addressLine1 = o.streetAddress || "";
                const addressLine2 = `${o.city || ""}, ${o.state || ""}, ${
                  o.postalCode || ""
                }`;

                const orderDateFormatted = o.orderDate
                  ? new Date(o.orderDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })
                  : "";

                return (
                  <tr
                    key={o._id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 text-slate-600">{idx + 1}</td>
                    <td className="px-3 py-2 text-slate-700">{customerId}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {o.firstName} {o.lastName}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{o.emailId}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {o.phoneNumber}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      <div className="leading-tight">
                        <div>{addressLine1}</div>
                        <div>{addressLine2}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{orderId}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {orderDateFormatted}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2 text-right">
                      <div
                        className="inline-flex"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => toggleMenu(e, o._id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FULL kebab menu */}
      {menuOpenId && activeOrder && (
        <div
          className="fixed z-50"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            transform: "translateX(-100%)",
          }}
          onClick={stopProp}
        >
          <div className="w-32 rounded-lg border border-slate-200 bg-white shadow-lg">
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setMenuOpenId(null);
                onEdit(activeOrder);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="none"
                className="h-3.5 w-3.5"
              >
                <path
                  d="M4 12.5 12.5 4 16 7.5 7.5 16H4v-3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Edit</span>
            </button>

            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
              onClick={() => {
                setMenuOpenId(null);
                onAskDelete(activeOrder);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="none"
                className="h-3.5 w-3.5"
              >
                <path
                  d="M5 6h10M8 6v8M12 6v8M6 6l1 9a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9l1-9M8.5 3h3a1 1 0 0 1 1 1V4H7.5v0a1 1 0 0 1 1-1Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <OrderFormModal
          order={editingOrder}
          onClose={() => setModalOpen(false)}
          onSaved={onSaved}
        />
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card w-full max-w-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Delete
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to delete the{" "}
              <span className="font-medium">{confirmDelete.product}</span>{" "}
              order?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteConfirmed}
                className="btn-primary text-xs px-3 py-1.5"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
