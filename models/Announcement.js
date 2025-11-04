import mongoose from "mongoose"

const announcementSchema = new mongoose.Schema(
  {
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide announcement title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide announcement description"],
    },
    image: String,
    type: {
      type: String,
      enum: ["promotion", "menu_update", "closure", "special_event", "general"],
      default: "general",
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true },
)

export default mongoose.model("Announcement", announcementSchema)
