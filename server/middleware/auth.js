// ============================================
// Authentication & Authorization Middleware
// ============================================
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'campus-lost-and-found-super-secret-key-2026';

// Fallback demo user for frictionless local evaluation
export const DEMO_USER = {
  id: '64f1a2b3c4d5e6f7a8b9c0d1',
  name: 'Demo Student',
  email: 'student@chitkara.edu.in',
  role: 'student',
};

export const DEMO_ADMIN = {
  id: '64f1a2b3c4d5e6f7a8b9c0d2',
  name: 'Campus Admin',
  email: 'admin@chitkara.edu.in',
  role: 'admin',
};

/**
 * Verifies JWT token from Authorization header and populates req.user.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to perform this action.',
    });
  }

  const token = authHeader.split(' ')[1];

  // Support demo token for testing
  if (token === 'demo-student-token') {
    req.user = DEMO_USER;
    return next();
  }
  if (token === 'demo-admin-token') {
    req.user = DEMO_ADMIN;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id || decoded._id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role || 'student',
    };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token. Please sign in again.',
    });
  }
};

/**
 * Optional authentication: populates req.user if token present, but does not block.
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (token === 'demo-student-token') {
    req.user = DEMO_USER;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id || decoded._id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role || 'student',
    };
  } catch {
    // Ignore invalid token on optional routes
  }
  next();
};

export default requireAuth;
