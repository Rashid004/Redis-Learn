import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/config/db.js";
import app from "./src/app.js";

// Pub/Sub services start karo (server ke saath)
import "./src/services/inventoryService.js";
import "./src/services/emailService.js";

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
  });
};

start();
