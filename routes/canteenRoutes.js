import express from "express"
import {
  createCanteen,
  getAllCanteens,
  getCanteenById,
  updateCanteen,
  uploadCanteenImage,
  deleteCanteen,
  getCanteensByOwner,
  verifyCanteen,
} from "../controllers/canteenController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.get("/", getAllCanteens)
// NOTE: place non-parameterized routes *before* parameter routes to avoid route conflicts
// Protected/public mix: owner-specific route must be declared before '/:id'

// Protected routes
// Protected routes
router.post("/", protect, authorize("canteen_owner", "admin"), createCanteen)
router.get("/owner/my-canteens", protect, getCanteensByOwner)
router.put("/:id", protect, authorize("canteen_owner", "admin"), updateCanteen)
router.post("/:id/upload-image", protect, authorize("canteen_owner", "admin"), uploadCanteenImage)
router.delete("/:id", protect, authorize("canteen_owner", "admin"), deleteCanteen)
router.get("/:id", getCanteenById)

// Admin routes
router.post("/:id/verify", protect, authorize("admin"), verifyCanteen)

export default router
