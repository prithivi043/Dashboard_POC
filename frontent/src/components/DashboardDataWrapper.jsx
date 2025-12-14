import React, { useState, useMemo } from "react";
import ExcelUpload from "./ExcelUpload.jsx";
import DashboardView from "./DashboardView.jsx"; // your existing dashboard component

const DashboardDataWrapper = () => {
  const [excelData, setExcelData] = useState(null);

  // Map parsed JSON → orders array expected by your dashboard
  const orders = useMemo(() => {
    if (!excelData) return [];

    const firstSheetName = excelData.workbookMeta.sheetNames[0];
    const rows = excelData.sheets[firstSheetName] || [];

    // Example mapping: adapt column names from Excel as needed
    return rows.map((row, index) => ({
      id: row["Order ID"] || `ROW-${index + 1}`,
      firstName: row["First name"] || row["First Name"] || "",
      lastName: row["Last name"] || row["Last Name"] || "",
      emailId: row["Email id"] || row["Email"] || "",
      phoneNumber: row["Phone number"] || "",
      streetAddress: row["Street Address"] || row["Address"] || "",
      city: row["City"] || "",
      state: row["State / Province"] || row["State"] || "",
      postalCode: row["Postal code"] || "",
      country: row["Country"] || "",
      product: row["Product"] || "",
      quantity: Number(row["Quantity"] ?? 0),
      unitPrice: Number(row["Unit price"] ?? 0),
      totalAmount: Number(row["Total amount"] ?? 0),
      status: row["Status"] || "",
      createdBy: row["Created by"] || "",
      orderDate: row["Order date"] || row["Order Date"] || "",
    }));
  }, [excelData]);

  return (
    <div className="space-y-4">
      {/* Top: Excel upload */}
      <ExcelUpload onDataParsed={setExcelData} />

      {/* Bottom: your existing dashboard using this data */}
      <DashboardView orders={orders} />
    </div>
  );
};

export default DashboardDataWrapper;
