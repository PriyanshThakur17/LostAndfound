// ============================================
// Item Controller (Shared Items CRUD API)
// ============================================
import mongoose from 'mongoose';
import Item from '../models/Item.js';
import { sampleItems } from '../../src/data/sampleItems.js';

// In-memory fallback if MongoDB connection is not active
let inMemoryItems = [...sampleItems];

/**
 * Helper to check if Mongoose is connected to MongoDB
 */
const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * POST /api/items
 * Create a new item (shared by Member 1 ReportLost and Member 2 ReportFound).
 * Expects FormData with single file 'image'.
 */
export const createItem = async (req, res) => {
  try {
    const { title, type, category, description, location, date } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Item title is required' });
    }
    if (!type || !['lost', 'found'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Valid type ("lost" or "found") is required' });
    }
    if (!category) {
      return res.status(400).json({ success: false, error: 'Category is required' });
    }
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Description must be at least 10 characters' });
    }
    if (!location) {
      return res.status(400).json({ success: false, error: 'Campus location is required' });
    }
    if (!date) {
      return res.status(400).json({ success: false, error: 'Date is required' });
    }

    // Determine image path from Multer file upload (no Base64 in MongoDB!)
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const itemData = {
      title: title.trim(),
      type,
      category,
      description: description.trim(),
      location,
      date,
      image: imagePath,
      status: 'Open',
      createdBy: req.user?.name || 'Student',
      userId: req.user?.id || null,
    };

    if (isMongoConnected()) {
      const newItem = await Item.create(itemData);
      return res.status(201).json({
        success: true,
        message: `${type === 'found' ? 'Found' : 'Lost'} item reported successfully`,
        item: newItem,
      });
    }

    // In-memory fallback
    const mockId = new mongoose.Types.ObjectId().toString();
    const mockItem = {
      ...itemData,
      _id: mockId,
      id: mockId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryItems.unshift(mockItem);

    return res.status(201).json({
      success: true,
      message: `${type === 'found' ? 'Found' : 'Lost'} item reported successfully (offline mode)`,
      item: mockItem,
    });
  } catch (err) {
    console.error('Error creating item:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Server error creating item report',
    });
  }
};

/**
 * GET /api/items
 * Retrieve items with optional search and filters.
 * Excludes sensitive fields.
 */
export const getItems = async (req, res) => {
  try {
    const { type, category, location, status, search, sort } = req.query;

    if (isMongoConnected()) {
      const filter = {};

      if (type && type !== 'all') filter.type = type;
      if (category && category !== 'all') filter.category = category;
      if (location && location !== 'all') filter.location = location;
      if (status && status !== 'all') filter.status = status;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ title: regex }, { description: regex }, { location: regex }];
      }

      let query = Item.find(filter);

      if (sort === 'oldest') {
        query = query.sort({ createdAt: 1 });
      } else if (sort === 'az') {
        query = query.sort({ title: 1 });
      } else if (sort === 'za') {
        query = query.sort({ title: -1 });
      } else {
        query = query.sort({ createdAt: -1 });
      }

      const items = await query.exec();
      return res.json({ success: true, count: items.length, items });
    }

    // In-memory filtering
    let results = [...inMemoryItems];

    if (type && type !== 'all') results = results.filter((i) => i.type === type);
    if (category && category !== 'all') results = results.filter((i) => i.category === category);
    if (location && location !== 'all') results = results.filter((i) => i.location === location);
    if (status && status !== 'all') results = results.filter((i) => i.status === status);
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.location?.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: results.length, items: results });
  } catch (err) {
    console.error('Error fetching items:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving items' });
  }
};

/**
 * GET /api/items/:id
 * Retrieve a single item by ID.
 */
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Invalid Item ID format' });
      }
      const item = await Item.findById(id).populate('userId', 'name email role');
      if (!item) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }
      return res.json({ success: true, item });
    }

    const item = inMemoryItems.find((i) => String(i.id || i._id) === String(id));
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    return res.json({ success: true, item });
  } catch (err) {
    console.error('Error fetching item by id:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving item' });
  }
};
