import jwt from "jsonwebtoken"

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    console.log('❌ [Auth] No token provided');
    return res.status(401).json({ success: false, message: "Not authorized to access this route" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('✅ [Auth] Token verified for user:', decoded.id, 'Role:', decoded.role);
    req.user = decoded
    next()
  } catch (error) {
    console.error('❌ [Auth] Token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Token has expired. Please login again." })
    }
    return res.status(401).json({ success: false, message: "Not authorized to access this route" })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      })
    }
    next()
  }
}
