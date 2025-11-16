import mongoose from "mongoose"
import Order from "../models/Order.js"
import Canteen from "../models/Canteen.js"
import Dish from "../models/Dish.js"
import Review from "../models/Review.js"
import User from "../models/User.js" // Declare the User variable

// Get canteen analytics
export const getCanteenAnalytics = async (req, res) => {
  try {
    const { canteenId } = req.params
    const { startDate, endDate } = req.query

    // Verify ownership
    const canteen = await Canteen.findById(canteenId)
    if (!canteen) {
      return res.status(404).json({ success: false, message: "Canteen not found" })
    }
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" })
    }

    // Convert canteenId to ObjectId for aggregation
    const canteenObjectId = new mongoose.Types.ObjectId(canteenId)
    
    const filter = { canteen: canteenObjectId }
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }

    // Total orders
    const totalOrders = await Order.countDocuments(filter)

    // Revenue
    const revenueData = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
    ])

    // Popular dishes
    const popularDishes = await Order.aggregate([
      { $match: filter },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.dish",
          count: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: "dishes", localField: "_id", foreignField: "_id", as: "dishInfo" } },
    ])

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Average rating
    const avgRating = canteen.ratings.averageRating

    res.status(200).json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        completedOrders: revenueData[0]?.completedOrders || 0,
        averageRating: avgRating,
        totalReviews: canteen.ratings.totalReviews,
        popularDishes,
        statusBreakdown,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get platform analytics (Admin only)
export const getPlatformAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const filter = {}
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }

    // Total metrics
    const totalOrders = await Order.countDocuments(filter)
    const totalCanteens = await Canteen.countDocuments()
    const totalDishes = await Dish.countDocuments()
    const totalReviews = await Review.countDocuments()

    // Revenue
    const revenueData = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ])

    // Top canteens
    const topCanteens = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$canteen",
          orderCount: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      { $lookup: { from: "canteens", localField: "_id", foreignField: "_id", as: "canteenInfo" } },
    ])

    res.status(200).json({
      success: true,
      analytics: {
        totalOrders,
        totalCanteens,
        totalDishes,
        totalReviews,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        topCanteens,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get recommendations
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id

    // Get user's order history
    const userOrders = await Order.find({ student: userId }).populate("items.dish")

    // Get favorite canteens
    const user = await User.findById(userId)
    const favoriteCanteens = user.preferences.favoriteCanteens

    // Get popular dishes from favorite canteens
    const recommendations = await Dish.find({
      canteen: { $in: favoriteCanteens },
      availability: true,
    })
      .sort({ "popularity.score": -1 })
      .limit(10)
      .populate("canteen", "name image")

    res.status(200).json({
      success: true,
      recommendations,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
