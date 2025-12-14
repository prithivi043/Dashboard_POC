// src/pages/DashboardConfigPage.jsx
import React from "react";
import DashboardConfig from "../components/DashboardConfig.jsx";

const LOCAL_STORAGE_KEY_ORDERS = "dashboard_orders";
const LOCAL_STORAGE_KEY_WIDGETS = "dashboard_widgets";

const DashboardConfigPage = ({
  orders,
  setOrders, // currently unused, but kept for future
  widgets,
  setWidgets,
  onClose,
}) => {
  const handleSave = () => {
    try {
      // Persist both orders and widgets so a refresh restores everything
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY_ORDERS,
        JSON.stringify(orders)
      );
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY_WIDGETS,
        JSON.stringify(widgets)
      );
    } catch (e) {
      console.error("Failed to persist dashboard state:", e);
    }

    if (onClose) onClose();
  };

  return (
    <DashboardConfig
      orders={orders}
      widgets={widgets}
      setWidgets={setWidgets}
      onDone={onClose}
      onSave={handleSave}
    />
  );
};

export default DashboardConfigPage;
