// ============================================
// Claim Controller — Member 2 Responsibility
// ============================================
import mongoose from 'mongoose';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';

// In-memory fallback if MongoDB connection is not active
let inMemoryClaims = [];

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * POST /api/claims
 * Submit a claim or found-item report response.
 * Derives claimant identity from authenticated JWT user (req.user.id).
 */
export const createClaim = async (req, res) => {
  try {
    const { itemId, verificationAnswers, claimType } = req.body;
    const claimantId = req.user?.id;

    if (!claimantId) {
      return res.status(401).json({ success: false, error: 'Authentication required to submit a claim' });
    }

    if (!itemId) {
      return res.status(400).json({ success: false, error: 'Item ID is required' });
    }

    if (!verificationAnswers || typeof verificationAnswers !== 'object') {
      return res.status(400).json({ success: false, error: 'Verification answers are required' });
    }

    if (!verificationAnswers.contactName || !verificationAnswers.contactName.trim()) {
      return res.status(400).json({ success: false, error: 'Contact name is required' });
    }

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ success: false, error: 'Invalid Item ID format' });
      }

      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }

      if (item.status === 'Claimed') {
        return res.status(400).json({ success: false, error: 'This item has already been claimed' });
      }
      if (item.status === 'Archived') {
        return res.status(400).json({ success: false, error: 'This item report is archived' });
      }

      // Check for existing pending claim by this user
      const existingPending = await Claim.findOne({
        item: itemId,
        claimant: claimantId,
        status: 'Pending',
      });
      if (existingPending) {
        return res.status(400).json({
          success: false,
          error: 'You already have a pending verification submitted for this item.',
        });
      }

      // Validate answers based on item type
      const effectiveType = claimType || (item.type === 'found' ? 'ownership_claim' : 'found_report');

      if (effectiveType === 'ownership_claim') {
        if (!verificationAnswers.itemColor?.trim() || !verificationAnswers.uniqueFeature?.trim() || !verificationAnswers.lostLocation?.trim()) {
          return res.status(400).json({
            success: false,
            error: 'Color, unique feature, and lost location are required for ownership verification.',
          });
        }
      } else {
        if (!verificationAnswers.foundLocation?.trim() || !verificationAnswers.foundDate?.trim()) {
          return res.status(400).json({
            success: false,
            error: 'Found location and date are required for reporting a found item.',
          });
        }
      }

      // Create new claim with status Pending (do NOT mark item Claimed yet!)
      const newClaim = await Claim.create({
        item: itemId,
        claimant: claimantId,
        claimType: effectiveType,
        status: 'Pending',
        verificationAnswers: {
          itemColor: verificationAnswers.itemColor?.trim() || '',
          uniqueFeature: verificationAnswers.uniqueFeature?.trim() || '',
          lostLocation: verificationAnswers.lostLocation?.trim() || '',
          foundLocation: verificationAnswers.foundLocation?.trim() || '',
          foundDate: verificationAnswers.foundDate?.trim() || '',
          additionalInfo: verificationAnswers.additionalInfo?.trim() || '',
          contactName: verificationAnswers.contactName.trim(),
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Verification submitted successfully. Your claim is currently Pending review.',
        claim: newClaim,
      });
    }

    // In-memory fallback
    const claimId = new mongoose.Types.ObjectId().toString();
    const mockClaim = {
      _id: claimId,
      id: claimId,
      item: itemId,
      claimant: claimantId,
      claimType: claimType || 'ownership_claim',
      status: 'Pending',
      verificationAnswers: { ...verificationAnswers },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryClaims.push(mockClaim);

    return res.status(201).json({
      success: true,
      message: 'Verification submitted successfully (offline mode). Your claim is currently Pending review.',
      claim: mockClaim,
    });
  } catch (err) {
    console.error('Error submitting claim:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error submitting claim' });
  }
};

/**
 * GET /api/claims/mine
 * Retrieve all claims belonging to the authenticated user.
 */
export const getMyClaims = async (req, res) => {
  try {
    const claimantId = req.user?.id;
    if (!claimantId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (isMongoConnected()) {
      const claims = await Claim.find({ claimant: claimantId })
        .populate('item', 'title type category location date status image')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: claims.length, claims });
    }

    const claims = inMemoryClaims.filter((c) => String(c.claimant) === String(claimantId));
    return res.json({ success: true, count: claims.length, claims });
  } catch (err) {
    console.error('Error fetching user claims:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving claims' });
  }
};

/**
 * GET /api/items/:id/claims
 * Retrieve all claims for an item.
 * Restricted to item owner or an authorized administrator.
 */
export const getItemClaims = async (req, res) => {
  try {
    const { id: itemId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ success: false, error: 'Invalid Item ID' });
      }

      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }

      // Authorization check: only item owner or admin can review claims
      const isOwner = item.userId && String(item.userId) === String(userId);
      const isAdmin = userRole === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized. Only the item owner or an administrator can view claims for this item.',
        });
      }

      const claims = await Claim.find({ item: itemId })
        .populate('claimant', 'name email')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: claims.length, claims });
    }

    // In-memory fallback
    const claims = inMemoryClaims.filter((c) => String(c.item) === String(itemId));
    return res.json({ success: true, count: claims.length, claims });
  } catch (err) {
    console.error('Error fetching item claims:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving item claims' });
  }
};

/**
 * PATCH /api/claims/:id
 * Approve or reject a claim.
 * Restricted to authorized item owner or administrator.
 * When approved, sets item status to 'Claimed'.
 */
export const updateClaimStatus = async (req, res) => {
  try {
    const { id: claimId } = req.params;
    const { status, reviewNotes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be updated to either "Approved" or "Rejected"',
      });
    }

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(claimId)) {
        return res.status(400).json({ success: false, error: 'Invalid Claim ID' });
      }

      const claim = await Claim.findById(claimId).populate('item');
      if (!claim) {
        return res.status(404).json({ success: false, error: 'Claim not found' });
      }

      const item = claim.item;
      if (!item) {
        return res.status(404).json({ success: false, error: 'Associated item not found' });
      }

      // Authorization check: item owner or admin
      const isOwner = item.userId && String(item.userId) === String(userId);
      const isAdmin = userRole === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized. Only the item owner or administrator can approve or reject claims.',
        });
      }

      // Update claim
      claim.status = status;
      claim.reviewedBy = userId;
      claim.reviewedAt = new Date();
      if (reviewNotes) claim.reviewNotes = reviewNotes.trim();
      await claim.save();

      // If approved, update Item status to 'Claimed'
      if (status === 'Approved') {
        item.status = 'Claimed';
        await item.save();

        // Reject other pending claims for this item
        await Claim.updateMany(
          { item: item._id, _id: { $ne: claim._id }, status: 'Pending' },
          {
            $set: {
              status: 'Rejected',
              reviewNotes: 'Another claim was approved for this item.',
              reviewedBy: userId,
              reviewedAt: new Date(),
            },
          }
        );
      }

      return res.json({
        success: true,
        message: `Claim successfully ${status.toLowerCase()}`,
        claim,
        itemStatus: item.status,
      });
    }

    // In-memory fallback
    const claim = inMemoryClaims.find((c) => String(c._id || c.id) === String(claimId));
    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    claim.status = status;
    claim.reviewedBy = userId;
    claim.reviewedAt = new Date().toISOString();
    if (reviewNotes) claim.reviewNotes = reviewNotes;

    return res.json({
      success: true,
      message: `Claim successfully ${status.toLowerCase()} (offline mode)`,
      claim,
      itemStatus: status === 'Approved' ? 'Claimed' : 'Open',
    });
  } catch (err) {
    console.error('Error updating claim status:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error updating claim' });
  }
};
