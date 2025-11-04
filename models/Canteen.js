import mongoose from "mongoose"

const canteenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide canteen name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide canteen description"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      building: String,
      floor: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    image: {
      type: String,
      default: null,
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    cuisineTypes: [String],
    contactPhone: String,
    email: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
      score: {
        type: Number,
        default: 0,
      },
      orderCount: {
        type: Number,
        default: 0,
      },
    },
    documents: {
      licenseImage: String,
      certificateImage: String,
    },
  },
  { timestamps: true },
)

export default mongoose.model("Canteen", canteenSchema)
