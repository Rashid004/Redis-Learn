import express from "express";
import cache from "../middleware/cache.js";
import Product from "../models/Product.js";
import redis from "../config/redis.js";

const router = express.Router();

router.get("/", cache(1800), async (req, res) => {
  const products = await Product.find();
  res.json(products);
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
