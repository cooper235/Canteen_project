import express from "express"
import { getCanteenAnalytics, getPlatformAnalytics, getRecommendations } from "../controllers/analyticsController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

// Protected routes
router.get("/canteen/:canteenId", protect, authorize("canteen_owner", "admin"), getCanteenAnalytics)
router.get("/recommendations", protect, getRecommendations)

// Admin routes
router.get("/platform/overview", protect, authorize("admin"), getPlatformAnalytics)

export default router
