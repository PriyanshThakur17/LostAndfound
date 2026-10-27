// ============================================
// Claim Routes — Member 1, 2, 4 Integration
// ============================================
import express from 'express';
import {
  createClaim,
  getAllClaims,
  getMyClaims,
  getItemClaims,
  updateClaimStatus,
} from '../controllers/claimController.js';

const router = express.Router();

// POST /api/claims — submit a claim or found-item verification
router.post('/', createClaim);

// GET /api/claims — retrieve all claims
router.get('/', getAllClaims);

// GET /api/claims/mine — retrieve claims for current user
router.get('/mine', getMyClaims);

// GET /api/claims/item/:id — retrieve claims for an item
router.get('/item/:id', getItemClaims);

// PATCH /api/claims/:id — approve or reject a claim
router.patch('/:id', updateClaimStatus);

export default router;
