const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Item = require('../models/Item');

/**
 * @route   POST /api/claims
 * @desc    Submit an ownership claim or finder report for an item
 */
router.post('/', async (req, res) => {
  try {
    const {
      itemId,
      claimType,
      contactName,
      itemColor,
      uniqueFeature,
      lostLocation,
      foundLocation,
      foundDate,
      additionalInfo,
    } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'itemId is required to file a claim',
      });
    }

    if (!contactName || !contactName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact name is required',
      });
    }

    // Check if the item exists in the database
    const targetItem = await Item.findById(itemId);
    if (!targetItem) {
      return res.status(404).json({
        success: false,
        message: 'Target item not found in registry',
      });
    }

    // Determine default claimType based on item type if not explicitly supplied
    const effectiveClaimType =
      claimType ||
      (targetItem.type === 'found'
        ? 'ownership_verification'
        : 'found_item_report');

    // Create the Claim document in the `claims` collection
    const claim = new Claim({
      itemId,
      claimType: effectiveClaimType,
      contactName: contactName.trim(),
      itemColor: itemColor ? itemColor.trim() : '',
      uniqueFeature: uniqueFeature ? uniqueFeature.trim() : '',
      lostLocation: lostLocation ? lostLocation.trim() : '',
      foundLocation: foundLocation ? foundLocation.trim() : '',
      foundDate: foundDate || '',
      additionalInfo: additionalInfo ? additionalInfo.trim() : '',
      status: 'Pending',
    });

    const savedClaim = await claim.save();

    // Mark the item as Claimed in the items collection
    targetItem.status = 'Claimed';
    await targetItem.save();

    res.status(201).json({
      success: true,
      message: 'Claim recorded successfully and item status updated to Claimed',
      data: {
        claim: savedClaim,
        item: targetItem,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record claim',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/claims
 * @desc    Get all claims (admin / registry coordination)
 */
router.get('/', async (req, res) => {
  try {
    const claims = await Claim.find().populate('itemId').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error('Error in GET /api/claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve claims',
      error: error.message,
    });
  }
});

module.exports = router;
