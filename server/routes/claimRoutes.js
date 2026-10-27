// ============================================
// Claim Routes — Member 2 Responsibility
// ============================================
import express from 'express';
import {
  createClaim,
  getMyClaims,
  getItemClaims,
  updateClaimStatus,
} from '../controllers/claimController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/claims — submit a claim or found-item response
router.post('/', requireAuth, createClaim);

// GET /api/claims/mine — retrieve claims belonging to the authenticated user
router.get('/mine', requireAuth, getMyClaims);

// GET /api/claims/item/:id — retrieve claims for an item (restricted to owner or admin)
router.get('/item/:id', requireAuth, getItemClaims);

// PATCH /api/claims/:id — approve or reject a claim (restricted to owner or admin)
router.patch('/:id', requireAuth, updateClaimStatus);

export default router;
