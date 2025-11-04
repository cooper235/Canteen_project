import User from "../models/User.js"
import jwt from "jsonwebtoken"

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" })
    }

    // Check if user already exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ success: false, message: "User already exists" })
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "student",
    })

    const token = generateToken(user._id, user.role)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" })
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" })
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" })
    }

    const token = generateToken(user._id, user.role)

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Logout (client-side token removal)
export const logout = (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" })
}
