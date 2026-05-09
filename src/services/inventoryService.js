import Redis from "ioredis";
import Product from "../models/Product.js";

const sub = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
});
const pub = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
});

sub.subscribe("orders:new", "orders:cancelled");

sub.on("message", async (channel, message) => {
  const data = JSON.parse(message);

  if (channel === "orders:new") {
    await Product.findByIdAndUpdate(data.productId, {
      $inc: { stock: -data.quantity },
    });
    const remaining = await pub.decrby(
      `stock:${data.productId}`,
      data.quantity,
    );
    console.log(`[InventoryService] Stock updated. Remaining: ${remaining}`);

    if (remaining < 10) {
      await pub.publish(
        "inventory:low",
        JSON.stringify({ productId: data.productId, remaining }),
      );
      console.log(`[InventoryService] LOW STOCK ALERT sent!`);
    }
  }

  if (channel === "orders:cancelled") {
    await pub.incrby(`stock:${data.productId}`, data.quantity);
    console.log(`[InventoryService] Stock restored for cancellation`);
  }
});

console.log("[InventoryService] Listening...");
