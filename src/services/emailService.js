import Redis from "ioredis";

const sub = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

sub.subscribe("orders:new", "orders:shipped");

sub.on("message", (channel, message) => {
  const data = JSON.parse(message);

  if (channel === "orders:new") {
    console.log(
      `[EmailService] Order ${data.orderId} confirmation → ${data.userEmail}`,
    );
  }

  if (channel === "orders:shipped") {
    console.log(`[EmailService] Shipped! Tracking: ${data.trackingId}`);
  }
});

sub.on("error", (err) => console.error("[EmailService] error:", err));
console.log("[EmailService] Listening...");
