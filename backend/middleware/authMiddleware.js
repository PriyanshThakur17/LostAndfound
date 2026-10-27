// ============================================
// Campus Lost & Found — Auth Middleware
// ============================================
// Protects routes that require a valid JWT.
// JWT is read from the HttpOnly cookie 'token'.
// ============================================

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect — verifies the JWT in the HttpOnly cookie.
 * Attaches the authenticated user to req.user.
 * Passes 401 to the error handler if the token is
 * missing, expired, or invalid.
 */
export const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user record (without password) to request.
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

/**
 * authorizeRoles — restricts a route to specific roles.
 * Must be used AFTER protect().
 *
 * Usage:
 *   router.delete('/item/:id', protect, authorizeRoles('admin'), handler)
 *
 * @param {...string} roles - Allowed role strings ('user', 'admin')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};
