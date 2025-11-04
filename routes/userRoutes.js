import express from "express"
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
  uploadProfileImage,
  addFavoriteCanteen,
  removeFavoriteCanteen,
  getFavoriteCanteens,
  deleteUser,
  deactivateAccount,
} from "../controllers/userController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.get("/:id", getUserById)

// Protected routes
router.put("/profile/update", protect, updateUserProfile)
router.post("/profile/upload-image", protect, uploadProfileImage)
router.post("/favorites/add", protect, addFavoriteCanteen)
router.post("/favorites/remove", protect, removeFavoriteCanteen)
router.get("/favorites/list", protect, getFavoriteCanteens)
router.post("/deactivate", protect, deactivateAccount)

// Admin routes
router.get("/", protect, authorize("admin"), getAllUsers)
router.delete("/:id", protect, authorize("admin"), deleteUser)

export default router
