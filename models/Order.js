import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: true,
    },
    items: [
      {
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: Number,
        specialInstructions: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "wallet"],
      default: "cash",
    },
    deliveryType: {
      type: String,
      enum: ["pickup", "delivery"],
      default: "pickup",
    },
    estimatedTime: Date,
    completedTime: Date,
    specialRequests: String,
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    feedback: String,
  },
  { timestamps: true },
)

// Generate unique order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments()
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`
  }
  next()
})

export default mongoose.model("Order", orderSchema)
