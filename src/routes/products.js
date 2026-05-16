import express from "express";
import cache from "../middleware/cache.js";
import Product from "../models/Product.js";
import redis from "../config/redis.js";

const router = express.Router();

router.get("/flush-cache", async (req, res) => {
  await redis.del("cache:/api/products");
  res.json({ message: "Cache cleared" });
});

router.get("/test", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", cache(1800), async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", cache(3600), async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

router.post("/", async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

router.put("/:id", async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  await redis.del(`cache:/api/products/${req.params.id}`);
  await redis.del("cache:/api/products");
  res.json(updated);
});

export default router;
