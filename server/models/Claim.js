// ============================================
// Claim Model (Mongoose) — Member 2 Responsibility
// ============================================
import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item reference is required'],
      index: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant reference is required'],
      index: true,
    },
    claimType: {
      type: String,
      enum: ['ownership_claim', 'found_report'],
      default: 'ownership_claim',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    verificationAnswers: {
      // For ownership verification on found items
      itemColor: { type: String, trim: true, default: '' },
      uniqueFeature: { type: String, trim: true, default: '' },
      lostLocation: { type: String, trim: true, default: '' },

      // For finder reports on lost items
      foundLocation: { type: String, trim: true, default: '' },
      foundDate: { type: String, trim: true, default: '' },
      additionalInfo: { type: String, trim: true, default: '' },

      // Contact identifier for communication
      contactName: { type: String, trim: true, required: true },
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate Pending claims from the same claimant on the same item
claimSchema.index({ item: 1, claimant: 1, status: 1 });

const Claim = mongoose.models.Claim || mongoose.model('Claim', claimSchema);
export default Claim;
