import Joi from "joi"

export const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(30),
    phone: Joi.string().required().min(10),
    role: Joi.string().valid("student", "canteen_owner", "admin"),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message })
  }
  next()
}

export const validateCreateDish = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(100),
    description: Joi.string().required().min(10),
    category: Joi.string().required().valid("breakfast", "lunch", "dinner", "snacks", "beverages", "desserts"),
    price: Joi.number().required().min(0),
    ingredients: Joi.array().items(Joi.string()),
    allergens: Joi.array().items(Joi.string()),
    isVegetarian: Joi.boolean(),
    isVegan: Joi.boolean(),
    isSpicy: Joi.boolean(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message })
  }
  next()
}

export const validateCreateOrder = (req, res, next) => {
  const schema = Joi.object({
    canteenId: Joi.string().required(),
    items: Joi.array()
      .items(
        Joi.object({
          dishId: Joi.string().required(),
          quantity: Joi.number().required().min(1),
          specialInstructions: Joi.string(),
        }),
      )
      .required(),
    paymentMethod: Joi.string().valid("cash", "card", "upi", "wallet"),
    deliveryType: Joi.string().valid("pickup", "delivery"),
    specialRequests: Joi.string(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message })
  }
  next()
}

export const validateCreateReview = (req, res, next) => {
  const schema = Joi.object({
    canteenId: Joi.string(),
    dishId: Joi.string(),
    rating: Joi.number().required().min(1).max(5),
    title: Joi.string().required().min(5).max(100),
    comment: Joi.string().required().min(10),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message })
  }
  next()
}
