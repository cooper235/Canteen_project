import Review from "../models/Review.js"
import Canteen from "../models/Canteen.js"
import Dish from "../models/Dish.js"
import Order from "../models/Order.js"
import axios from 'axios'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

// Create review
export const createReview = async (req, res) => {
  try {
    const { canteenId, dishId, orderId, rating, title, comment } = req.body

    // Validate at least one target
    if (!canteenId && !dishId) {
      return res.status(400).json({ success: false, message: "Please provide canteen or dish ID" })
    }

    // Verify purchase if order provided
    let isVerifiedPurchase = false
    if (orderId) {
      const order = await Order.findById(orderId)
      if (order && order.student.toString() === req.user.id && order.status === "completed") {
        isVerifiedPurchase = true
      }
    }

    // Analyze sentiment using ML service
    let sentimentData = null
    if (comment) {
      try {
        const sentimentResponse = await axios.post(
          `${ML_SERVICE_URL}/api/sentiment/analyze`,
          { text: comment },
          { timeout: 5000 }
        )
        if (sentimentResponse.data.success) {
          sentimentData = sentimentResponse.data.sentiment
        }
      } catch (error) {
        console.warn('Sentiment analysis failed, continuing without it:', error.message)
      }
    }

    const review = await Review.create({
      reviewer: req.user.id,
      canteen: canteenId || null,
      dish: dishId || null,
      order: orderId || null,
      rating,
      title,
      comment,
      isVerifiedPurchase,
      status: 'approved', // Auto-approve all reviews for now
      sentiment: sentimentData ? sentimentData.sentiment : 'neutral',
      sentimentScore: sentimentData ? sentimentData.score : 0,
      sentimentKeywords: sentimentData ? sentimentData.keywords : [],
    })

    // Update ratings in canteen/dish
    if (canteenId) {
      const reviews = await Review.find({ canteen: canteenId, status: "approved" })
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      await Canteen.findByIdAndUpdate(canteenId, {
        "ratings.averageRating": avgRating,
        "ratings.totalReviews": reviews.length,
      })
    }

    if (dishId) {
      const reviews = await Review.find({ dish: dishId, status: "approved" })
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      await Dish.findByIdAndUpdate(dishId, {
        "ratings.averageRating": avgRating,
        "ratings.totalReviews": reviews.length,
      })
    }

    await review.populate("reviewer", "name profileImage")

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get reviews for canteen
export const getCanteenReviews = async (req, res) => {
  try {
    const { canteenId } = req.params
    const { sortBy } = req.query

    let query = Review.find({ canteen: canteenId, status: "approved" }).populate("reviewer", "name profileImage")

    if (sortBy === "helpful") {
      query = query.sort({ helpful: -1 })
    } else if (sortBy === "newest") {
      query = query.sort({ createdAt: -1 })
    } else if (sortBy === "rating-high") {
      query = query.sort({ rating: -1 })
    } else if (sortBy === "rating-low") {
      query = query.sort({ rating: 1 })
    }

    const reviews = await query

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get reviews for dish
export const getDishReviews = async (req, res) => {
  try {
    const { dishId } = req.params
    const { sortBy } = req.query

    let query = Review.find({ dish: dishId, status: "approved" }).populate("reviewer", "name profileImage")

    if (sortBy === "helpful") {
      query = query.sort({ helpful: -1 })
    } else if (sortBy === "newest") {
      query = query.sort({ createdAt: -1 })
    } else if (sortBy === "rating-high") {
      query = query.sort({ rating: -1 })
    } else if (sortBy === "rating-low") {
      query = query.sort({ rating: 1 })
    }

    const reviews = await query

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate("canteen", "name")
      .populate("dish", "name")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Mark review as helpful
export const markHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { $inc: { helpful: 1 } }, { new: true })

    res.status(200).json({
      success: true,
      message: "Review marked as helpful",
      review,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Mark review as unhelpful
export const markUnhelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { $inc: { unhelpful: 1 } }, { new: true })

    res.status(200).json({
      success: true,
      message: "Review marked as unhelpful",
      review,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Approve review (Admin/Canteen Owner)
export const approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true })

    res.status(200).json({
      success: true,
      message: "Review approved",
      review,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" })
    }

    if (review.reviewer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this review" })
    }

    await review.remove()

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" })
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
