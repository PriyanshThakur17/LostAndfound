// ============================================
// Item Model (Shared Campus Registry Item)
// ============================================
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['lost', 'found'],
        message: 'Type must be either "lost" or "found"',
      },
      required: [true, 'Item type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Documents',
        'Accessories',
        'Books',
        'Clothing',
        'Bags',
        'Keys',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      enum: [
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
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
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
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for fast search and filter queries
itemSchema.index({ type: 1, status: 1, category: 1, location: 1 });
itemSchema.index({ title: 'text', description: 'text' });

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);
export default Item;
