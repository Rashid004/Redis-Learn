import express from "express";
import redis from "../config/redis.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, productId, quantity, userEmail } = req.body;

  const stockKey = `stock:${productId}`;
  let stock = await redis.get(stockKey);

  if (!stock) {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    stock = product.stock;
    await redis.set(stockKey, stock);
  }

  if (parseInt(stock) < quantity) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  const product = await Product.findById(productId);
  const amount = product.price * quantity;

  const order = await Order.create({
    userId,
    productId,
    quantity,
    amount,
    userEmail,
  });

  await redis.publish(
    "orders:new",
    JSON.stringify({
      orderId: order._id,
      userId,
      productId,
      quantity,
      amount,
      userEmail,
    }),
  );

  res.status(201).json({ success: true, orderId: order._id, amount });
});

router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id).populate("productId");
  res.json(order);
});

export default router;
