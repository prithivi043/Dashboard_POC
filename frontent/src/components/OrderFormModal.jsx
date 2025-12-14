// src/components/OrderFormModal.jsx
import React, { useEffect, useState } from "react";
import api from "../apiClient";

const countries = [
  "United States",
  "Canada",
  "Australia",
  "Singapore",
  "Hong Kong",
];

const products = [
  "Fiber Internet 300 Mbps",
  "5G Unlimited Mobile Plan",
  "Fiber Internet 1 Gbps",
  "Business Internet 500 Mbps",
  "VoIP Corporate Package",
];

const createdByOptions = [
  "Mr. Michael Harris",
  "Mr. Ryan Cooper",
  "Ms. Olivia Carter",
  "Mr. Lucas Martin",
];

const statuses = ["Pending", "In progress", "Completed"];

const INITIAL_VALUES = {
  firstName: "",
  lastName: "",
  emailId: "",
  phoneNumber: "",
  streetAddress: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  product: "",
  quantity: "",
  unitPrice: 0,
  status: "",
  createdBy: "",
};

const OrderFormModal = ({ order, onClose, onSaved }) => {
  const isEdit = !!order?._id;

  const [focusField, setFocusField] = useState({
    product: false,
    quantity: false,
    unitPrice: false,
    status: false,
    createdBy: false,
  });

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (order && isEdit) {
      const next = { ...INITIAL_VALUES, ...order };

      if (!countries.includes(next.country))
        next.country = INITIAL_VALUES.country;
      if (!products.includes(next.product))
        next.product = INITIAL_VALUES.product;
      if (!statuses.includes(next.status)) next.status = INITIAL_VALUES.status;
      if (!createdByOptions.includes(next.createdBy)) {
        next.createdBy = INITIAL_VALUES.createdBy;
      }

      setValues(next);
    } else {
      setValues(INITIAL_VALUES);
    }

    setErrors({});
    setSubmitError("");
  }, [order, isEdit]);

  const setField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const required = [
      "firstName",
      "lastName",
      "emailId",
      "phoneNumber",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "country",
      "product",
      "quantity",
      "unitPrice",
      "status",
      "createdBy",
    ];

    const next = {};

    required.forEach((f) => {
      if (values[f] === "" || values[f] === null || values[f] === undefined) {
        next[f] = "Please fill the field";
      }
    });

    if (Number(values.quantity) < 1) {
      next.quantity = "Quantity cannot be less than 1";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const totalAmountRaw =
    Number(values.quantity || 0) * Number(values.unitPrice || 0);
  const totalAmount = Number.isFinite(totalAmountRaw) ? totalAmountRaw : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    const payload = {
      ...values,
      quantity: Number(values.quantity),
      unitPrice: Number(values.unitPrice),
      totalAmount,
    };

    try {
      setSubmitting(true);

      if (isEdit) {
        await api.put(`/orders/${order._id}`, payload);
        onSaved && onSaved("edit");
      } else {
        await api.post("/orders", payload);
        onSaved && onSaved("create",payload);
      }
    } catch (err) {
      console.error(
        "Failed to save order:",
        err,
        "response:",
        err?.response?.data
      );
      setSubmitError(
        err?.response?.data?.message ||
          "Failed to save order. Please check server logs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="card w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-[18px] font-semibold text-slate-900">
            {isEdit ? "Edit order" : "Create order"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-1 rounded-full cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-6 text-xs">
          {submitError && (
            <p className="mb-1 text-[11px] text-red-500">{submitError}</p>
          )}

          {/* CUSTOMER INFORMATION */}
          <section>
            <h3 className="mb-2 text-[14px] font-semibold text-slate-700">
              Customer Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["firstName", "First name"],
                ["lastName", "Last name"],
                ["emailId", "Email id"],
                ["phoneNumber", "Phone number"],
                ["streetAddress", "Street Address", "full"], // FULL WIDTH
                ["city", "City"],
                ["state", "State / Province"],
                ["postalCode", "Postal code"],
              ].map(([field, label, full]) => (
                <div
                  key={field}
                  className={`relative ${
                    full === "full" ? "md:col-span-2" : ""
                  }`}
                >
                  <input
                    className="peer w-full border border-slate-300 rounded-lg px-3 pt-4 pb-2 text-[14px] bg-white
                    focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    placeholder=" "
                    value={values[field] || ""}
                    onChange={(e) => setField(field, e.target.value)}
                  />

                  <label
                    className={`absolute left-3 px-1 z-10 bg-white text-slate-500 transition-all duration-200
                    ${
                      values[field]
                        ? "-top-2.5 text-[12px] text-emerald-600"
                        : "top-3.5 text-[14px]"
                    }
                    peer-focus:-top-2.5 peer-focus:text-[12px] peer-focus:text-emerald-600`}
                  >
                    {label} <span className="text-red-500">*</span>
                  </label>

                  {errors[field] && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {errors[field]}
                    </p>
                  )}
                </div>
              ))}

              {/* COUNTRY SELECT */}
              <div className="relative">
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 pt-5 pb-2 text-[14px] bg-white appearance-none
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  value={values.country || ""}
                  onFocus={() =>
                    setFocusField({ ...focusField, country: true })
                  }
                  onBlur={() =>
                    setFocusField({ ...focusField, country: false })
                  }
                  onChange={(e) => setField("country", e.target.value)}
                >
                  <option value="" disabled hidden></option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <label
                  className={`absolute left-3 px-1 z-10 text-slate-500 bg-white transition-all duration-200 pointer-events-none
                  ${
                    focusField.country || values.country
                      ? "-top-2.5 text-[12px] text-emerald-600"
                      : "top-3.5 text-[14px]"
                  }`}
                >
                  Country <span className="text-red-500">*</span>
                </label>

                {errors.country && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {errors.country}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ORDER INFORMATION */}
          <section>
            <h3 className="mb-2 text-[14px] font-semibold text-slate-700">
              Order Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* PRODUCT FULL WIDTH */}
              <div className="relative w-full md:col-span-2">
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 pt-5 pb-2 text-[14px] bg-white appearance-none
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  value={values.product || ""}
                  onFocus={() =>
                    setFocusField({ ...focusField, product: true })
                  }
                  onBlur={() =>
                    setFocusField({ ...focusField, product: false })
                  }
                  onChange={(e) => setField("product", e.target.value)}
                >
                  <option value="" disabled hidden></option>
                  {products.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <label
                  className={`absolute left-3 px-1 z-10 text-slate-500 bg-white transition-all duration-200 pointer-events-none
                  ${
                    focusField.product || values.product
                      ? "-top-2.5 text-[12px] text-emerald-600"
                      : "top-3.5 text-[14px]"
                  }`}
                >
                  Choose product *
                </label>

                {errors.product && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {errors.product}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  className="w-full border border-slate-300 rounded-lg px-3 pt-4 pb-2 text-[14px]
                  bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  value={values.quantity}
                  onChange={(e) =>
                    setField("quantity", Math.max(1, Number(e.target.value)))
                  }
                  onFocus={() =>
                    setFocusField({ ...focusField, quantity: true })
                  }
                  onBlur={() =>
                    setFocusField({ ...focusField, quantity: false })
                  }
                />

                <label
                  className={`absolute left-3 px-1 z-10 text-slate-500 bg-white transition-all pointer-events-none
                  ${
                    focusField.quantity || values.quantity
                      ? "-top-2.5 text-[11px] text-emerald-600"
                      : "top-3.5 text-[14px]"
                  }`}
                >
                  Quantity *
                </label>

                {errors.quantity && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {errors.quantity}
                  </p>
                )}
              </div>

              {/* Unit Price */}
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  className="w-full border border-slate-300 rounded-lg px-3 pt-4 pb-2 text-[14px]
                  bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  value={values.unitPrice}
                  onChange={(e) =>
                    setField("unitPrice", Number(e.target.value))
                  }
                  onFocus={() =>
                    setFocusField({ ...focusField, unitPrice: true })
                  }
                  onBlur={() =>
                    setFocusField({ ...focusField, unitPrice: false })
                  }
                />

                <label
                  className={`absolute left-3 px-1 z-10 bg-white text-slate-500 transition-all pointer-events-none
                  ${
                    focusField.unitPrice || values.unitPrice
                      ? "-top-2.5 text-[11px] text-emerald-600"
                      : "top-3.5 text-[14px]"
                  }`}
                >
                  Unit price * (Currency)
                </label>

                {errors.unitPrice && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {errors.unitPrice}
                  </p>
                )}
              </div>

              {/* Total Amount */}
              <div className="relative">
                <input
                  type="number"
                  readOnly
                  className="w-full border border-slate-300 rounded-lg px-3 pt-4 pb-2 text-[14px]
                  bg-white peer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={(
                    (Number(values.quantity) || 0) *
                    (Number(values.unitPrice) || 0)
                  ).toFixed(2)}
                />

                <label
                  className={`absolute left-3 px-1 z-10 bg-white text-slate-500 transition-all pointer-events-none
                  ${
                    values.quantity || values.unitPrice
                      ? "-top-2.5 text-[11px] text-emerald-600"
                      : "top-3.5 text-[14px]"
                  }`}
                >
                  Total amount *
                </label>
              </div>

              {/* Status */}
              <div className="relative">
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 pt-5 pb-2 bg-white text-[14px]
                  appearance-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={values.status || ""}
                  onChange={(e) => setField("status", e.target.value)}
                  onFocus={() => setFocusField({ ...focusField, status: true })}
                  onBlur={() => setFocusField({ ...focusField, status: false })}
                >
                  <option value="" disabled hidden></option>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>

                <label
                  className={`absolute left-3 px-1 z-10 bg-white text-slate-500 transition-all pointer-events-none
                  ${
                    focusField.status || values.status
                      ? "-top-2.5 text-[12px] text-emerald-600"
                      : "top-3.5 text-[14px]"
                  }`}
                >
                  Status *
                </label>

                {errors.status && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {errors.status}
                  </p>
                )}
              </div>

              {/* Created By */}
              <div className="relative">
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 pt-4 pb-2 bg-white text-[14px]
                  appearance-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={values.createdBy}
                  onChange={(e) => setField("createdBy", e.target.value)}
                  onFocus={() =>
                    setFocusField({ ...focusField, createdBy: true })
                  }
                  onBlur={() =>
                    setFocusField({ ...focusField, createdBy: false })
                  }
                >
                  <option value="">Select creator</option>
                  {createdByOptions.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>

                <label
                  className={`absolute left-3 px-1 z-10 bg-white text-slate-500 transition-all pointer-events-none
                  ${
                    focusField.createdBy || values.createdBy
                      ? "-top-2.5 text-[11px] text-emerald-600"
                      : "top-3.5 text-[14px]"
                  }`}
                >
                  Created by *
                </label>

                {errors.createdBy && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {errors.createdBy}
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-[14px] px-3 py-1.5 cursor-pointer"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs px-3 py-1.5 disabled:opacity-60 cursor-pointer"
              disabled={submitting}
            >
              {submitting
                ? isEdit
                  ? "Saving..."
                  : "Submitting..."
                : isEdit
                ? "Save"
                : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderFormModal;
