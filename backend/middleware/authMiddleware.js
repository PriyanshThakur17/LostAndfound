// ============================================
// Campus Lost & Found — Auth Middleware
// ============================================
// Protects routes that require a valid JWT.
// Reads JWT from HttpOnly cookie or Authorization Bearer header.
// ============================================

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcampuslostandfoundjwtkey2026';

/**
 * protect — verifies the JWT in HttpOnly cookie or Bearer header.
 * Attaches the authenticated user to req.user.
 */
export const protect = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers?.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user record to request
    req.user = await User.findById(decoded.id || decoded._id);

    if (!req.user) {
      // In case user was deleted or demo payload was signed directly
      if (decoded.email) {
        req.user = {
          _id: decoded.id || 'demo_student_id',
          name: decoded.name || 'Campus Student',
          email: decoded.email,
          role: decoded.role || 'user',
        };
        return next();
      }
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
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

export const authenticate = protect;
export default protect;
