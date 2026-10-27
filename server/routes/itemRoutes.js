const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

/**
 * @route   GET /api/items
 * @desc    Get all items with search, filter, and sort options
 * @query   type, category, location, status, search, sort
 */
router.get('/', async (req, res) => {
  try {
    const { type, category, location, status, search, sort } = req.query;

    // Build Mongo query object
    const filter = {};

    if (type && type !== 'all') {
      filter.type = type.toLowerCase();
    }

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = location;
    }

    if (status) {
      filter.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { location: searchRegex },
      ];
    }

    // Build sort object
    let sortOption = { createdAt: -1 }; // Default: newest
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'az') {
      sortOption = { title: 1 };
    } else if (sort === 'za') {
      sortOption = { title: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const items = await Item.find(filter).sort(sortOption);

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Error in GET /api/items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve items',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/items/:id
 * @desc    Get single item details by MongoDB _id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format',
      });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in registry',
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error(`Error in GET /api/items/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving item',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/items
 * @desc    Create a new lost or found item
 */
router.post('/', async (req, res) => {
  try {
    const {
      type,
      title,
      category,
      description,
      location,
      date,
      image,
      status,
      createdBy,
    } = req.body;

    const newItem = new Item({
      type,
      title,
      category,
      description,
      location,
      date: date || new Date().toISOString().split('T')[0],
      image: image || '',
      status: status || 'Open',
      createdBy: createdBy || 'Student',
    });

    const savedItem = await newItem.save();

    res.status(201).json({
      success: true,
      message: 'Item registered successfully',
      data: savedItem,
    });
  } catch (error) {
    console.error('Error in POST /api/items:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create item',
      error: error.message,
    });
  }
});

module.exports = router;
