import mongoose from "mongoose"

const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide dish name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide dish description"],
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: true,
    },
    category: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snacks", "beverages", "desserts"],
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide dish price"],
      min: 0,
    },
    image: {
      type: String,
      default: null,
    },
    ingredients: [String],
    allergens: [String],
    nutritionInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    isSpicy: {
      type: Boolean,
      default: false,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    ratings: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    popularity: {
      orderCount: {
        type: Number,
        default: 0,
      },
      score: {
        type: Number,
        default: 0,
      },
    },
    tags: [String],
  },
  { timestamps: true },
)

export default mongoose.model("Dish", dishSchema)
