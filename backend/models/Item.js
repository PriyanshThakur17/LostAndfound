import mongoose from 'mongoose';

export const CATEGORIES = [
  'Electronics',
  'Documents',
  'Accessories',
  'Books',
  'Clothing',
  'Bags',
  'Keys',
  'Other',
];

export const LOCATIONS = [
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
];

export const STATUSES = ['Open', 'Claimed', 'Archived'];
export const TYPES = ['lost', 'found'];

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Item type is required (lost or found)'],
      enum: {
        values: TYPES,
        message: 'Type must be either "lost" or "found"',
      },
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      minlength: [2, 'Item title must be at least 2 characters'],
      maxlength: [120, 'Item title cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Item category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Invalid campus category selected',
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Campus location is required'],
      enum: {
        values: LOCATIONS,
        message: 'Invalid campus location selected',
      },
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required (YYYY-MM-DD)'],
      validate: {
        validator: function (value) {
          const parsed = new Date(value);
          if (isNaN(parsed.getTime())) return false;
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return parsed <= today;
        },
        message: 'Date cannot be in the future',
      },
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Invalid status. Must be Open, Claimed, or Archived',
      },
      default: 'Open',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporting user reference (createdBy) is required'],
      index: true,
    },
    // Optional compatibility fields used by ReportFound form
    currentLocation: {
      type: String,
      trim: true,
      default: '',
    },
    contact: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

// Compound text index for search queries
itemSchema.index({ title: 'text', description: 'text' });

export const Item = mongoose.model('Item', itemSchema);
export default Item;
