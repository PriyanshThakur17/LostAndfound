import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcampuslostandfoundjwtkey2026';

/**
 * Authentication Middleware:
 * Extracts Bearer token from Authorization header, verifies signature,
 * and attaches authenticated user to req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      // Clean up uploaded file if request had one
      if (req.file) {
        import('./upload.js').then(({ removeUploadedFile }) => {
          removeUploadedFile(`/uploads/${req.file.filename}`);
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing Bearer token.',
      });
    }

    // Verify cryptographic JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    try {
      user = await User.findById(decoded.id);
    } catch {
      // Database might be initializing
    }

    // Fallback to verified JWT payload if user document isn't reachable
    if (!user) {
      if (decoded.id) {
        user = {
          _id: decoded.id,
          name: decoded.name || 'Campus Student',
          email: decoded.email || 'student@chitkara.edu.in',
          role: decoded.role || 'student',
        };
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid session. User account not found.',
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (req.file) {
      import('./upload.js').then(({ removeUploadedFile }) => {
        removeUploadedFile(`/uploads/${req.file.filename}`);
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid token.',
    });
  }
};
