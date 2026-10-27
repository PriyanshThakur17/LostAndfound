const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Associated Item ID is required'],
    },
    claimType: {
      type: String,
      enum: ['ownership_verification', 'found_item_report'],
      default: 'ownership_verification',
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    // Ownership verification fields (for found items being claimed)
    itemColor: {
      type: String,
      trim: true,
      default: '',
    },
    uniqueFeature: {
      type: String,
      trim: true,
      default: '',
    },
    lostLocation: {
      type: String,
      trim: true,
      default: '',
    },
    // Found item report fields (for lost items reported found by finder)
    foundLocation: {
      type: String,
      trim: true,
      default: '',
    },
    foundDate: {
      type: String,
      default: '',
    },
    additionalInfo: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'claims',
  }
);

claimSchema.index({ itemId: 1 });

module.exports = mongoose.model('Claim', claimSchema);
