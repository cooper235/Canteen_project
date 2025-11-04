import Canteen from "../models/Canteen.js"
import cloudinary from "../config/cloudinary.js"

// Create canteen
export const createCanteen = async (req, res) => {
  try {
    const { name, description, location, operatingHours, cuisineTypes, contactPhone, email } = req.body

    const canteen = await Canteen.create({
      name,
      description,
      location,
      operatingHours,
      cuisineTypes,
      contactPhone,
      email,
      owner: req.user.id,
    })

    res.status(201).json({
      success: true,
      message: "Canteen created successfully",
      canteen,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all canteens
export const getAllCanteens = async (req, res) => {
  try {
    const { isActive, isVerified, cuisineType, sortBy } = req.query
    const filter = {}

    if (isActive !== undefined) filter.isActive = isActive === "true"
    if (isVerified !== undefined) filter.isVerified = isVerified === "true"
    if (cuisineType) filter.cuisineTypes = { $in: [cuisineType] }

    let query = Canteen.find(filter)
      .populate("owner", "name email phone")
      .maxTimeMS(20000) // Set maximum execution time to 20 seconds

    if (sortBy === "rating") {
      query = query.sort({ "ratings.averageRating": -1 })
    } else if (sortBy === "popularity") {
      query = query.sort({ "popularity.score": -1 })
    } else if (sortBy === "newest") {
      query = query.sort({ createdAt: -1 })
    }

    // Add lean() for better performance when we don't need Mongoose documents
    const canteens = await query.lean().exec()

    res.status(200).json({
      success: true,
      count: canteens.length,
      canteens,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get canteen by ID
export const getCanteenById = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.id).populate("owner", "name email phone")

    if (!canteen) {
      return res.status(404).json({ success: false, message: "Canteen not found" })
    }

    res.status(200).json({ success: true, canteen })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update canteen
export const updateCanteen = async (req, res) => {
  try {
    let canteen = await Canteen.findById(req.params.id)

    if (!canteen) {
      return res.status(404).json({ success: false, message: "Canteen not found" })
    }

    // Check ownership
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this canteen" })
    }

    canteen = await Canteen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: "Canteen updated successfully",
      canteen,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Upload canteen image
export const uploadCanteenImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }

    const canteen = await Canteen.findById(req.params.id)
    if (!canteen) {
      return res.status(404).json({ success: false, message: "Canteen not found" })
    }

    // Check ownership
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this canteen" })
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "canteen/canteens",
      resource_type: "auto",
    })

    canteen.image = result.secure_url
    await canteen.save()

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      canteen,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete canteen
export const deleteCanteen = async (req, res) => {
  try {
    let canteen = await Canteen.findById(req.params.id)

    if (!canteen) {
      return res.status(404).json({ success: false, message: "Canteen not found" })
    }

    // Check ownership
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this canteen" })
    }

    canteen = await Canteen.findByIdAndDelete(req.params.id)

    if (!canteen) {
      return res.status(404).json({ success: false, message: "Canteen not found" })
    }

    res.status(200).json({
      success: true,
      message: "Canteen deleted successfully",
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get canteens by owner
export const getCanteensByOwner = async (req, res) => {
  try {
    const canteens = await Canteen.find({ owner: req.user.id })

    res.status(200).json({
      success: true,
      count: canteens.length,
      canteens,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Verify canteen (Admin only)
export const verifyCanteen = async (req, res) => {
  try {
    const canteen = await Canteen.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true })

    res.status(200).json({
      success: true,
      message: "Canteen verified successfully",
      canteen,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
