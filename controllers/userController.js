import User from "../models/User.js"
import cloudinary from "../config/cloudinary.js"

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query
    const filter = {}

    if (role) filter.role = role
    if (isActive !== undefined) filter.isActive = isActive === "true"

    const users = await User.find(filter).select("-password")
    res.status(200).json({ success: true, count: users.length, users })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    res.status(200).json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, dietary, allergies } = req.body
    const userId = req.user.id

    const updateData = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (dietary) updateData["preferences.dietary"] = dietary
    if (allergies) updateData["preferences.allergies"] = allergies

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")

    res.status(200).json({ success: true, message: "Profile updated successfully", user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "canteen/profiles",
      resource_type: "auto",
    })

    const user = await User.findByIdAndUpdate(req.user.id, { profileImage: result.secure_url }, { new: true }).select(
      "-password",
    )

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      user,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Add favorite canteen
export const addFavoriteCanteen = async (req, res) => {
  try {
    const { canteenId } = req.body
    const userId = req.user.id

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { "preferences.favoriteCanteens": canteenId } },
      { new: true },
    ).select("-password")

    res.status(200).json({
      success: true,
      message: "Canteen added to favorites",
      user,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Remove favorite canteen
export const removeFavoriteCanteen = async (req, res) => {
  try {
    const { canteenId } = req.body
    const userId = req.user.id

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { "preferences.favoriteCanteens": canteenId } },
      { new: true },
    ).select("-password")

    res.status(200).json({
      success: true,
      message: "Canteen removed from favorites",
      user,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get user's favorite canteens
export const getFavoriteCanteens = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("preferences.favoriteCanteens")
    res.status(200).json({
      success: true,
      favoriteCanteens: user.preferences.favoriteCanteens,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    res.status(200).json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Deactivate user account
export const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { isActive: false }, { new: true }).select("-password")

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
      user,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
