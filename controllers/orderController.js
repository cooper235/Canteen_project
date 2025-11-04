import Order from "../models/Order.js"
import Dish from "../models/Dish.js"
import Canteen from "../models/Canteen.js"

// Create order
export const createOrder = async (req, res) => {
  try {
    const { canteenId, items, paymentMethod, deliveryType, specialRequests } = req.body

    // Validate canteen
    const canteen = await Canteen.findById(canteenId)
    if (!canteen) {
      return res.status(404).json({ success: false, message: "Canteen not found" })
    }

    // Validate and calculate total
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const dish = await Dish.findById(item.dishId)
      if (!dish) {
        return res.status(404).json({ success: false, message: `Dish ${item.dishId} not found` })
      }

      if (!dish.availability) {
        return res.status(400).json({ success: false, message: `Dish ${dish.name} is not available` })
      }

      const itemTotal = dish.price * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        dish: item.dishId,
        quantity: item.quantity,
        price: dish.price,
        specialInstructions: item.specialInstructions,
      })
    }

    const order = await Order.create({
      student: req.user.id,
      canteen: canteenId,
      items: orderItems,
      totalAmount,
      paymentMethod,
      deliveryType,
      specialRequests,
    })

    await order.populate("student", "name email phone").populate("canteen", "name").populate("items.dish", "name price")

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, canteenId, sortBy } = req.query
    const filter = {}

    if (status) filter.status = status
    if (paymentStatus) filter.paymentStatus = paymentStatus
    if (canteenId) filter.canteen = canteenId

    let query = Order.find(filter)
      .populate("student", "name email phone")
      .populate("canteen", "name")
      .populate("items.dish", "name price")

    if (sortBy === "newest") {
      query = query.sort({ createdAt: -1 })
    } else if (sortBy === "oldest") {
      query = query.sort({ createdAt: 1 })
    }

    const orders = await query

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.user.id })
      .populate("canteen", "name image")
      .populate("items.dish", "name price image")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get canteen's orders
export const getCanteenOrders = async (req, res) => {
  try {
    const { canteenId } = req.params
    const { status } = req.query

    // Verify ownership
    const canteen = await Canteen.findById(canteenId)
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" })
    }

    const filter = { canteen: canteenId }
    if (status) filter.status = status

    const orders = await Order.find(filter)
      .populate("student", "name email phone")
      .populate("items.dish", "name price")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("student", "name email phone")
      .populate("canteen", "name")
      .populate("items.dish", "name price image")

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    res.status(200).json({ success: true, order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    let order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    const canteen = await Canteen.findById(order.canteen)
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this order" })
    }

    order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("student", "name email phone")
      .populate("canteen", "name")
      .populate("items.dish", "name price")

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body
    let order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    const canteen = await Canteen.findById(order.canteen)
    if (canteen.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this order" })
    }

    order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true })

    res.status(200).json({
      success: true,
      message: "Payment status updated",
      order,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    if (order.status === "completed" || order.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Cannot cancel this order" })
    }

    order.status = "cancelled"
    await order.save()

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Rate order
export const rateOrder = async (req, res) => {
  try {
    const { rating, feedback } = req.body

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 0 and 5" })
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { rating, feedback }, { new: true })

    res.status(200).json({
      success: true,
      message: "Order rated successfully",
      order,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
