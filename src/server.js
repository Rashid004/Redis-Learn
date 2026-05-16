import "dotenv/config";
import connectDB from "./config/db.js";
import app from "./app.js";

import "./services/inventoryService.js";
import "./services/emailService.js";

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
  });
};

start();
