import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Import modular routes
import authRoutes from "./modules/auth/auth.routes.js";
import hotelRoutes from "./modules/hotel/hotel.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import deliveryRoutes from "./modules/delivery/delivery.routes.js";
import workerRoutes from "./modules/nightworker/worker.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/user", userRoutes); 
app.use("/api/order", orderRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/worker", workerRoutes);

// Global error handler — must be defined AFTER all routes
app.use((err, req, res, next) => {
  const status  = err.status ?? err.statusCode ?? 500;
  const message = err.message || "Internal Server Error";

  console.error(`\n[ERROR] ${req.method} ${req.originalUrl}`);
  console.error(`[ERROR] Status: ${status}`);
  console.error(`[ERROR] Message: ${message}`);
  if (status === 500) console.error(err.stack);

  res.status(status).json({ error: message });
});
// DB + Server
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();