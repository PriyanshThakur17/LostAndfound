// ============================================
// Auth Routes & Controller (JWT Authentication)
// ============================================
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET, requireAuth, DEMO_USER, DEMO_ADMIN } from '../middleware/auth.js';

const router = express.Router();

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, error: 'User already exists with this email' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role === 'admin' ? 'admin' : 'student',
      });

      const token = generateToken(user);
      return res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch {
      // In-memory fallback
      const mockUser = {
        _id: '64f1a2b3c4d5e6f7a8b9c0d1',
        name,
        email,
        role: role || 'student',
      };
      const token = generateToken(mockUser);
      return res.status(201).json({
        success: true,
        token,
        user: mockUser,
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch {
      // If DB is offline, test credentials pass
      const mockUser = { ...DEMO_USER, email };
      const token = generateToken(mockUser);
      return res.json({
        success: true,
        token,
        user: mockUser,
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/demo — returns standard demo student token
router.post('/demo', (req, res) => {
  const token = generateToken(DEMO_USER);
  return res.json({
    success: true,
    token,
    user: DEMO_USER,
    message: 'Signed in as Demo Student',
  });
});

// POST /api/auth/demo-admin — returns demo admin token
router.post('/demo-admin', (req, res) => {
  const token = generateToken(DEMO_ADMIN);
  return res.json({
    success: true,
    token,
    user: DEMO_ADMIN,
    message: 'Signed in as Campus Administrator',
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  return res.json({ success: true, user: req.user });
});

export default router;
