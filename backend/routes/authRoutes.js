// ============================================
// Campus Lost & Found — Auth Routes
// ============================================

import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes (JWT required)
router.get('/me', protect, getMe);

export default router;
