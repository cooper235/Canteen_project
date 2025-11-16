import Announcement from "../models/Announcement.js"
import Canteen from "../models/Canteen.js"

// Create announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { canteen, canteenId, title, description, image, type, startDate, endDate, priority, isActive } = req.body
    
    // Support both 'canteen' and 'canteenId' field names
    const targetCanteenId = canteen || canteenId

    if (!targetCanteenId) {
      return res.status(400).json({ success: false, message: "Canteen ID is required" })
    }

    // Verify canteen ownership
    const canteenDoc = await Canteen.findById(targetCanteenId)
    if (!canteenDoc) {
      return res.status(404).json({ success: false, message: "Canteen not found" })
    }
    if (canteenDoc.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" })
    }

    const announcement = await Announcement.create({
      canteen: targetCanteenId,
      title,
      description,
      image,
      type,
      startDate,
      endDate,
      priority,
      isActive,
    })

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement,
    })
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get announcements for canteen
export const getCanteenAnnouncements = async (req, res) => {
  try {
    const { canteenId } = req.params

    // If user is authenticated and is the owner, show all announcements
    // Otherwise, only show active ones
    const filter = { canteen: canteenId }
    
    // If not authenticated or not the owner, only show active announcements
    if (!req.user) {
      filter.isActive = true
    } else if (req.user) {
      const canteen = await Canteen.findById(canteenId)
      if (canteen && canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
        filter.isActive = true
      }
    }

    const announcements = await Announcement.find(filter)
      .populate("canteen", "name")
      .sort({ priority: -1, createdAt: -1 })

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all active announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate("canteen", "name")
      .sort({ priority: -1, createdAt: -1 })

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    let announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" })
    }

    const canteen = await Canteen.findById(announcement.canteen)
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this announcement" })
    }

    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" })
    }

    const canteen = await Canteen.findById(announcement.canteen)
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this announcement" })
    }

    await Announcement.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
