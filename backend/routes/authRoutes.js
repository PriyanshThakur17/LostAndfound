import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcampuslostandfoundjwtkey2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper to sign JWT tokens
export const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * POST /api/auth/register
 * Register a new student or admin account
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role && ['admin', 'staff'].includes(role) ? role : 'student',
    });

    const token = signToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Authenticate existing user and return JWT
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/demo
 * Creates or retrieves standard demo student user and returns token.
 * Enables zero-friction local testing and Postman verification.
 */
router.post('/demo', async (req, res, next) => {
  try {
    const demoEmail = 'student@chitkara.edu.in';
    const demoPayload = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Demo Campus Student',
      email: demoEmail,
      role: 'student',
    };

    // If database is not currently connected, immediately return demo token without buffering
    if (User.db.readyState !== 1) {
      const token = signToken(demoPayload);
      return res.json({
        success: true,
        message: 'Demo student authentication token issued (local offline mode)',
        data: {
          token,
          user: {
            id: demoPayload._id,
            name: demoPayload.name,
            email: demoPayload.email,
            role: demoPayload.role,
          },
        },
      });
    }

    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo Campus Student',
        email: demoEmail,
        password: 'Password123!',
        role: 'student',
      });
    }

    const token = signToken(demoUser);

    return res.json({
      success: true,
      message: 'Demo student authentication token issued',
      data: {
        token,
        user: {
          id: demoUser._id.toString(),
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Retrieve currently logged in user info
 */
router.get('/me', authenticate, async (req, res) => {
  return res.json({
    success: true,
    data: req.user,
  });
});

export default router;
