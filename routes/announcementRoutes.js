import express from "express"
import {
  createAnnouncement,
  getCanteenAnnouncements,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.get("/", getAllAnnouncements)
router.get("/canteen/:canteenId", getCanteenAnnouncements)

// Protected routes
router.post("/", protect, authorize("canteen_owner", "admin"), createAnnouncement)
router.put("/:id", protect, authorize("canteen_owner", "admin"), updateAnnouncement)
router.delete("/:id", protect, authorize("canteen_owner", "admin"), deleteAnnouncement)

export default router
