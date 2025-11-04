import Dish from "../models/Dish.js"
import Canteen from "../models/Canteen.js"
import cloudinary from "../config/cloudinary.js"

// Create dish
export const createDish = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      ingredients,
      allergens,
      nutritionInfo,
      isVegetarian,
      isVegan,
      isSpicy,
      tags,
    } = req.body
    const { canteenId } = req.params

    // Verify canteen exists and user owns it
    const canteen = await Canteen.findById(canteenId)
    if (!canteen) {
      return res.status(404).json({ success: false, message: "Canteen not found" })
    }

    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to add dishes to this canteen" })
    }

    const dish = await Dish.create({
      name,
      description,
      canteen: canteenId,
      category,
      price,
      ingredients,
      allergens,
      nutritionInfo,
      isVegetarian,
      isVegan,
      isSpicy,
      tags,
    })

    res.status(201).json({
      success: true,
      message: "Dish created successfully",
      dish,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all dishes
export const getAllDishes = async (req, res) => {
  try {
    const { canteenId, category, isVegetarian, isVegan, minPrice, maxPrice, sortBy, search } = req.query
    const filter = { availability: true }

    if (canteenId) filter.canteen = canteenId
    if (category) filter.category = category
    if (isVegetarian === "true") filter.isVegetarian = true
    if (isVegan === "true") filter.isVegan = true
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number.parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = Number.parseFloat(maxPrice)
    }

    let query = Dish.find(filter).populate("canteen", "name image")

    if (search) {
      query = query.find({ $text: { $search: search } })
    }

    if (sortBy === "rating") {
      query = query.sort({ "ratings.averageRating": -1 })
    } else if (sortBy === "popularity") {
      query = query.sort({ "popularity.score": -1 })
    } else if (sortBy === "price-low") {
      query = query.sort({ price: 1 })
    } else if (sortBy === "price-high") {
      query = query.sort({ price: -1 })
    } else if (sortBy === "newest") {
      query = query.sort({ createdAt: -1 })
    }

    const dishes = await query

    res.status(200).json({
      success: true,
      count: dishes.length,
      dishes,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get dish by ID
export const getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id).populate("canteen")

    if (!dish) {
      return res.status(404).json({ success: false, message: "Dish not found" })
    }

    res.status(200).json({ success: true, dish })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update dish
export const updateDish = async (req, res) => {
  try {
    let dish = await Dish.findById(req.params.id)

    if (!dish) {
      return res.status(404).json({ success: false, message: "Dish not found" })
    }

    const canteen = await Canteen.findById(dish.canteen)
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this dish" })
    }

    dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: "Dish updated successfully",
      dish,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Upload dish image
export const uploadDishImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }

    const dish = await Dish.findById(req.params.id)
    if (!dish) {
      return res.status(404).json({ success: false, message: "Dish not found" })
    }

    const canteen = await Canteen.findById(dish.canteen)
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this dish" })
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "canteen/dishes",
      resource_type: "auto",
    })

    dish.image = result.secure_url
    await dish.save()

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      dish,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete dish
export const deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id)

    if (!dish) {
      return res.status(404).json({ success: false, message: "Dish not found" })
    }

    const canteen = await Canteen.findById(dish.canteen)
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this dish" })
    }

    await dish.remove()

    if (!dish) {
      return res.status(404).json({ success: false, message: "Dish not found" })
    }

    res.status(200).json({
      success: true,
      message: "Dish deleted successfully",
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get dishes by canteen
export const getDishesByCanteen = async (req, res) => {
  try {
    const { canteenId } = req.params
    const dishes = await Dish.find({ canteen: canteenId }).populate("canteen")

    res.status(200).json({
      success: true,
      count: dishes.length,
      dishes,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update dish availability
export const updateDishAvailability = async (req, res) => {
  try {
    const { availability } = req.body
    const dish = await Dish.findById(req.params.id)

    if (!dish) {
      return res.status(404).json({ success: false, message: "Dish not found" })
    }

    const canteen = await Canteen.findById(dish.canteen)
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this dish" })
    }

    dish.availability = availability
    await dish.save()

    res.status(200).json({
      success: true,
      message: "Dish availability updated",
      dish,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
