// ============================================
// Campus Lost & Found — Auth Controller
// ============================================
// Handles registration, login, logout, and
// current-user retrieval.
//
// Supports HttpOnly cookie + Bearer token in response
// ============================================

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ----- Helpers -----

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcampuslostandfoundjwtkey2026';

/**
 * Signs a JWT for the given user ID.
 * @param {string} id - MongoDB user ObjectId
 * @returns {string} Signed JWT string
 */
export const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '7d',
  });

/**
 * Attaches the JWT as an HttpOnly cookie and sends the
 * user object and token in the response body.
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
    token,
    data: { user, token },
  });
};

// ----- Controllers -----

/**
 * POST /api/auth/register
 * Body: { name, email, password, role }
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

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

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with that email already exists.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'user',
    });

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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    const isMatch = user && (
      (user.matchPassword && await user.matchPassword(password)) ||
      (user.comparePassword && await user.comparePassword(password))
    );

    if (!user || !isMatch) {
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
    expires: new Date(0),
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
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      user,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/demo
 * Issues a token for a demo student account
 */
export const demoLogin = async (req, res, next) => {
  try {
    const demoEmail = 'student.demo@campus.edu';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo Campus Student',
        email: demoEmail,
        password: 'Password123!',
        role: 'user',
      });
    }

    sendTokenCookie(demoUser, 200, res);
  } catch (error) {
    next(error);
  }
};
