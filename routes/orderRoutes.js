import express from "express"
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getCanteenOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  rateOrder,
} from "../controllers/orderController.js"
import { protect, authorize } from "../middleware/auth.js"
import { validateCreateOrder } from "../middleware/validation.js"

const router = express.Router()

// Protected routes
router.post("/", protect, validateCreateOrder, createOrder)
router.get("/my-orders", protect, getUserOrders)
// Place canteen-specific route before parameterized `/:id` to avoid conflicts
router.get("/canteen/:canteenId", protect, getCanteenOrders)
router.get("/:id", protect, getOrderById)
router.patch("/:id/status", protect, authorize("canteen_owner", "admin"), updateOrderStatus)
router.patch("/:id/payment-status", protect, authorize("canteen_owner", "admin"), updatePaymentStatus)
router.post("/:id/cancel", protect, cancelOrder)
router.post("/:id/rate", protect, rateOrder)

// Canteen owner routes
// (moved above to avoid route parameter conflicts)

// Admin routes
router.get("/", protect, authorize("admin"), getAllOrders)

export default router
