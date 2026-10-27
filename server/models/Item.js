const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['lost', 'found'],
        message: '{VALUE} is not a valid item type (must be "lost" or "found")',
      },
      required: [true, 'Item type is required'],
    },
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Electronics',
          'Documents',
          'Accessories',
          'Books',
          'Clothing',
          'Bags',
          'Keys',
          'Other',
        ],
        message: '{VALUE} is not a supported category',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Campus location is required'],
      enum: {
        values: [
          'Main Gate',
          'Library',
          'Cafeteria',
          'Block A',
          'Block B',
          'Auditorium',
          'Sports Complex',
          'Parking',
          'Hostel',
          'Other',
        ],
        message: '{VALUE} is not a recognized campus location',
      },
    },
    date: {
      type: String,
      required: [true, 'Date is required (YYYY-MM-DD)'],
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Open', 'Claimed', 'Archived'],
      default: 'Open',
    },
    createdBy: {
      type: String,
      default: 'Student',
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'items',
  }
);

// Indexes for fast searching and filtering
itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ category: 1, location: 1 });
itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);
