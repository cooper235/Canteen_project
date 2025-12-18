import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import morgan from "morgan"
import { createServer } from "http"
import { Server } from "socket.io"

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import canteenRoutes from "./routes/canteenRoutes.js"
import dishRoutes from "./routes/dishRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import announcementRoutes from "./routes/announcementRoutes.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"
import mlRoutes from "./routes/mlRoutes.js"
import chatbotRoutes from "./routes/chatbotRoutes.js"
import { authLimiter, apiLimiter, orderLimiter } from "./middleware/rateLimiter.js"

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Initialize Socket.IO with CORS
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
// Configure CORS to allow requests from the frontend
app.use(
  cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/canteens", canteenRoutes)
app.use("/api/dishes", dishRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/announcements", announcementRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/ml", mlRoutes)
app.use("/api/chatbot", chatbotRoutes)

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

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Join room for user-specific notifications
  socket.on("join", (userId) => {
    socket.join(`user:${userId}`)
    console.log(`User ${userId} joined their room`)
  })

  // Join room for canteen-specific notifications
  socket.on("joinCanteen", (canteenId) => {
    socket.join(`canteen:${canteenId}`)
    console.log(`Socket ${socket.id} joined canteen ${canteenId} room`)
  })

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Socket.IO initialized and ready for connections`)
})
