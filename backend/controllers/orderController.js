const Order = require("../models/Order");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    console.error("getOrders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const createOrder = async (req, res) => {
  try {
    const { quantity, unitPrice } = req.body;

    const order = new Order({
      ...req.body,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalAmount: Number(quantity) * Number(unitPrice),
    });

    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { quantity, unitPrice } = req.body;

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        totalAmount: Number(quantity) * Number(unitPrice),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("updateOrder error:", err);
    res.status(500).json({ message: "Failed to update order" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("deleteOrder error:", err);
    res.status(500).json({ message: "Failed to delete order" });
  }
};

module.exports = {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
};
