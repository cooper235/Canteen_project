import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      default: null,
    },
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      default: null,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "Please provide a review title"],
      trim: true,
    },
    comment: {
      type: String,
      required: [true, "Please provide a review comment"],
    },
    images: [String],
    helpful: {
      type: Number,
      default: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // ML-powered sentiment analysis fields
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
    sentimentScore: {
      type: Number,
      default: 0,
      min: -1,
      max: 1,
    },
    sentimentKeywords: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
)

export default mongoose.model("Review", reviewSchema)
