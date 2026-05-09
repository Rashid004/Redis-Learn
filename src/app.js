import express from "express";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";

const app = express();
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/health", (req, res) => res.json({ status: "OK" }));

export default app;
