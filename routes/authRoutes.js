import express from "express"
import { register, login, getCurrentUser, logout } from "../controllers/authController.js"
import { protect } from "../middleware/auth.js"
import { validateRegister } from "../middleware/validation.js"

const router = express.Router()

router.post("/register", validateRegister, register)
router.post("/login", login)
router.get("/me", protect, getCurrentUser)
router.post("/logout", protect, logout)

export default router
