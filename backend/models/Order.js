const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    emailId: String,
    phoneNumber: String,
    streetAddress: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,

    product: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    status: { type: String, default: "Pending" },
    createdBy: String,
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
