import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import morgan from "morgan"

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import canteenRoutes from "./routes/canteenRoutes.js"
import dishRoutes from "./routes/dishRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import announcementRoutes from "./routes/announcementRoutes.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"
import { authLimiter, apiLimiter, orderLimiter } from "./middleware/rateLimiter.js"

dotenv.config()

const app = express()

// Middleware
app.use(helmet())
// Configure CORS to allow requests from the frontend
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.use(morgan("combined"))
// limit request body sizes for safety
app.use(express.json({ limit: process.env.JSON_LIMIT || "10mb" }))
app.use(express.urlencoded({ limit: process.env.URLENCODE_LIMIT || "10mb", extended: true }))

import { connectDatabase } from "./config/database.js"

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await connectDatabase();
      break;
    } catch (error) {
      retries++;
      console.error(`Failed to connect to MongoDB (Attempt ${retries}/${maxRetries}):`, error.message);
      if (retries === maxRetries) {
        console.error('Could not connect to MongoDB after maximum retries. Server will continue running.');
      } else {
        console.log(`Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}

connectWithRetry();

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() })
})

app.use("/api/auth", authLimiter, authRoutes)
app.use("/api/users", apiLimiter, userRoutes)
app.use("/api/canteens", apiLimiter, canteenRoutes)
app.use("/api/dishes", apiLimiter, dishRoutes)
app.use("/api/orders", orderLimiter, orderRoutes)
app.use("/api/reviews", apiLimiter, reviewRoutes)
app.use("/api/announcements", apiLimiter, announcementRoutes)
app.use("/api/analytics", apiLimiter, analyticsRoutes)

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
})

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
