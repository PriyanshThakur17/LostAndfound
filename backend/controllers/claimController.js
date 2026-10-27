// ============================================
// Claim Controller — Members 1, 2, 4 Integration
// ============================================
import mongoose from 'mongoose';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import User from '../models/User.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * POST /api/claims
 * Submit a claim or found-item report response.
 * Supports both authenticated users and direct verification form submissions.
 */
export const createClaim = async (req, res, next) => {
  try {
    const { itemId, verificationAnswers, claimType } = req.body;
    const targetItemId = itemId || req.body.item;

    if (!targetItemId) {
      return res.status(400).json({ success: false, message: 'Item ID is required' });
    }

    // Merge answers from nested object or top-level fields
    const answers = verificationAnswers || req.body;
    const contactName = answers.contactName || req.body.contactName;

    if (!contactName || !contactName.trim()) {
      return res.status(400).json({ success: false, message: 'Contact name is required' });
    }

    let claimantId = req.user?.id || req.user?._id;

    // Fallback: assign or find a default demo student user if not authenticated
    if (!claimantId && isMongoConnected()) {
      const defaultUser = await User.findOne();
      if (defaultUser) claimantId = defaultUser._id;
    }

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(targetItemId)) {
        return res.status(400).json({ success: false, message: 'Invalid Item ID format' });
      }

      const item = await Item.findById(targetItemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found in registry' });
      }

      const effectiveType =
        claimType ||
        (item.type === 'found' ? 'ownership_claim' : 'found_report');

      // Create new claim with status Pending
      const newClaim = await Claim.create({
        item: targetItemId,
        claimant: claimantId || null,
        claimType: effectiveType,
        status: 'Pending',
        verificationAnswers: {
          itemColor: answers.itemColor?.trim() || req.body.itemColor?.trim() || '',
          uniqueFeature: answers.uniqueFeature?.trim() || req.body.uniqueFeature?.trim() || '',
          lostLocation: answers.lostLocation?.trim() || req.body.lostLocation?.trim() || '',
          foundLocation: answers.foundLocation?.trim() || req.body.foundLocation?.trim() || '',
          foundDate: answers.foundDate || req.body.foundDate || '',
          additionalInfo: answers.additionalInfo?.trim() || req.body.additionalInfo?.trim() || '',
          contactName: contactName.trim(),
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Verification submitted successfully. Your claim is currently Pending review.',
        data: newClaim,
        claim: newClaim,
      });
    }

    return res.status(503).json({
      success: false,
      message: 'Database connection is unavailable. Please verify MongoDB is running.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/claims
 * Retrieve all claims (admin or overview)
 */
export const getAllClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find()
      .populate('item', 'title category type location status')
      .populate('claimant', 'name email')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/claims/mine
 * Retrieve claims submitted by the authenticated user
 */
export const getMyClaims = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const claims = await Claim.find({ claimant: userId })
      .populate('item')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: claims.length, data: claims });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/claims/item/:id
 * Retrieve claims filed for a specific item
 */
export const getItemClaims = async (req, res, next) => {
  try {
    const { id: itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: 'Invalid Item ID' });
    }

    const claims = await Claim.find({ item: itemId })
      .populate('claimant', 'name email')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: claims.length, data: claims, claims });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/claims/:id
 * Approve or reject a claim.
 * When approved, updates item status to 'Claimed'.
 */
export const updateClaimStatus = async (req, res, next) => {
  try {
    const { id: claimId } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewerId = req.user?.id || req.user?._id;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be updated to either "Approved" or "Rejected"',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({ success: false, message: 'Invalid Claim ID' });
    }

    const claim = await Claim.findById(claimId).populate('item');
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    claim.status = status;
    if (reviewerId) claim.reviewedBy = reviewerId;
    claim.reviewedAt = new Date();
    if (reviewNotes) claim.reviewNotes = reviewNotes.trim();
    await claim.save();

    // If approved, update Item status to 'Claimed'
    if (status === 'Approved' && claim.item) {
      const item = await Item.findById(claim.item._id || claim.item);
      if (item) {
        item.status = 'Claimed';
        await item.save();
      }

      // Automatically reject other pending claims for this item
      await Claim.updateMany(
        { item: claim.item._id || claim.item, _id: { $ne: claim._id }, status: 'Pending' },
        {
          $set: {
            status: 'Rejected',
            reviewNotes: 'Another claim was approved for this item.',
            reviewedAt: new Date(),
          },
        }
      );
    }

    return res.json({
      success: true,
      message: `Claim successfully ${status.toLowerCase()}`,
      data: claim,
      claim,
    });
  } catch (err) {
    next(err);
  }
};
