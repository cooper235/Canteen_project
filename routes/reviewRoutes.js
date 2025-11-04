import express from "express"
import {
  createReview,
  getCanteenReviews,
  getDishReviews,
  getUserReviews,
  markHelpful,
  markUnhelpful,
  approveReview,
  deleteReview,
} from "../controllers/reviewController.js"
import { protect, authorize } from "../middleware/auth.js"
import { validateCreateReview } from "../middleware/validation.js"

const router = express.Router()

// Public routes
router.get("/canteen/:canteenId", getCanteenReviews)
router.get("/dish/:dishId", getDishReviews)

// Protected routes
router.post("/", protect, validateCreateReview, createReview)
router.get("/my-reviews", protect, getUserReviews)
router.post("/:id/helpful", protect, markHelpful)
router.post("/:id/unhelpful", protect, markUnhelpful)
router.delete("/:id", protect, authorize("student", "admin"), deleteReview)

// Admin/Canteen Owner routes
router.post("/:id/approve", protect, authorize("admin", "canteen_owner"), approveReview)

export default router
