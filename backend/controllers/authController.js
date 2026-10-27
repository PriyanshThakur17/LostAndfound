// ============================================
// Campus Lost & Found — Auth Controller
// ============================================
// Handles registration, login, logout, and
// current-user retrieval.
//
// JWT is delivered ONLY via HttpOnly cookie so
// the token is never accessible to JavaScript
// running in the browser (XSS protection).
// ============================================

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ----- Helpers -----

/**
 * Signs a JWT for the given user ID.
 * @param {string} id - MongoDB user ObjectId
 * @returns {string} Signed JWT string
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

/**
 * Attaches the JWT as an HttpOnly cookie and sends the
 * user object in the response body.
 *
 * Cookie flags:
 *  - httpOnly   → inaccessible to client JS (XSS protection)
 *  - sameSite   → 'strict' in production, 'lax' in dev
 *  - secure     → HTTPS-only in production
 *  - maxAge     → 7 days (matches JWT expiry)
 */
const sendTokenCookie = (user, statusCode, res) => {
  const token = signToken(user._id);
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  res.status(statusCode).json({
    success: true,
    user,
  });
};

// ----- Controllers -----

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // --- Input validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are all required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // --- Duplicate check ---
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with that email already exists.',
      });
    }

    // --- Create user (password hashed by pre-save hook in User model) ---
    const user = await User.create({ name, email, password });

    sendTokenCookie(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // --- Input validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // --- Find user, explicitly select password field ---
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      // Return same message for both "not found" and "wrong password"
      // to avoid user enumeration.
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenCookie(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Clears the auth cookie.
 */
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // immediate expiry
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 * Requires the 'protect' middleware.
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware.
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
