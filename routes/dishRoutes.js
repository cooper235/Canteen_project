import express from "express"
import {
  createDish,
  getAllDishes,
  getDishById,
  updateDish,
  uploadDishImage,
  deleteDish,
  getDishesByCanteen,
  updateDishAvailability,
} from "../controllers/dishController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.get("/", getAllDishes)
// Place non-parameterized or more specific routes before parameterized routes
router.get("/canteen/:canteenId", getDishesByCanteen)
router.get("/:id", getDishById)

// Protected routes
// Protected routes
router.post("/canteen/:canteenId", protect, authorize("canteen_owner", "admin"), createDish)
router.put("/:id", protect, authorize("canteen_owner", "admin"), updateDish)
router.post("/:id/upload-image", protect, authorize("canteen_owner", "admin"), uploadDishImage)
router.patch("/:id/availability", protect, authorize("canteen_owner", "admin"), updateDishAvailability)
router.delete("/:id", protect, authorize("canteen_owner", "admin"), deleteDish)

export default router
