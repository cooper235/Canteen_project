import rateLimit from "express-rate-limit"

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs (increased for development)
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: "Too many requests, please try again later",
})

export const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 orders per minute (increased for development)
  message: "Too many orders, please try again later",
})
