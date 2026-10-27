import mongoose from 'mongoose';
import Item, { CATEGORIES, LOCATIONS, STATUSES, TYPES } from '../models/Item.js';
import { removeUploadedFile } from '../middleware/upload.js';

/**
 * GET /api/items
 * Retrieve items with optional filters: type, category, location, status, q, sort
 */
export const getItems = async (req, res, next) => {
  try {
    const { type, category, location, status, q, sort } = req.query;

    const query = {};

    // Filter by type (lost / found)
    if (type && type !== 'all') {
      const normalizedType = type.toLowerCase();
      if (TYPES.includes(normalizedType)) {
        query.type = normalizedType;
      }
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by location
    if (location && location !== 'all') {
      query.location = location;
    }

    // Filter by status (Open / Claimed / Archived)
    if (status && status !== 'all') {
      query.status = status;
    }

    // Text search query across title, description, category, and location
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { location: searchRegex },
      ];
    }

    // Sorting options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'az') {
      sortOptions = { title: 1 };
    } else if (sort === 'za') {
      sortOptions = { title: -1 };
    }

    const items = await Item.find(query)
      .sort(sortOptions)
      .populate('createdBy', 'name email role avatar');

    return res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/items/:id
 * Retrieve a single item by MongoDB _id
 */
export const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Item not found. Invalid item identifier.',
      });
    }

    const item = await Item.findById(id).populate('createdBy', 'name email role avatar');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found with provided ID.',
      });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/items
 * Create a new lost or found report (Protected, multipart/form-data or json)
 */
export const createItem = async (req, res, next) => {
  let uploadedImagePath = null;

  try {
    if (req.file) {
      uploadedImagePath = `/uploads/${req.file.filename}`;
    }

    const {
      type,
      title,
      category,
      description,
      location,
      date,
      currentLocation,
      contact,
    } = req.body;

    // Server-side validation
    const errors = [];

    if (!type || !TYPES.includes(type.toLowerCase())) {
      errors.push('Type must be either "lost" or "found".');
    }

    if (!title || title.trim().length < 2) {
      errors.push('Item title is required and must be at least 2 characters.');
    }

    if (!category || !CATEGORIES.includes(category)) {
      errors.push(`Invalid category. Must be one of: ${CATEGORIES.join(', ')}.`);
    }

    if (!location || !LOCATIONS.includes(location)) {
      errors.push(`Invalid campus location. Must be one of: ${LOCATIONS.join(', ')}.`);
    }

    if (!description || description.trim().length < 10) {
      errors.push('Description is required and must be at least 10 characters.');
    }

    if (!date) {
      errors.push('Date is required.');
    } else {
      const parsedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (isNaN(parsedDate.getTime())) {
        errors.push('Invalid date format.');
      } else if (parsedDate > today) {
        errors.push('Report date cannot be in the future.');
      }
    }

    if (errors.length > 0) {
      if (uploadedImagePath) {
        removeUploadedFile(uploadedImagePath);
      }
      return res.status(400).json({
        success: false,
        message: errors.join(' '),
        errors,
      });
    }

    // Determine final image path (uploaded file or passed string)
    const image = uploadedImagePath || req.body.image || '';

    // Create item document referencing authenticated user
    const newItem = new Item({
      type: type.toLowerCase().trim(),
      title: title.trim(),
      category,
      description: description.trim(),
      location,
      date: date.trim(),
      image,
      status: 'Open',
      createdBy: req.user._id,
      currentLocation: currentLocation ? currentLocation.trim() : '',
      contact: contact ? contact.trim() : '',
    });

    const savedItem = await newItem.save();
    await savedItem.populate('createdBy', 'name email role avatar');

    return res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully.`,
      data: savedItem,
    });
  } catch (err) {
    if (uploadedImagePath) {
      removeUploadedFile(uploadedImagePath);
    }
    next(err);
  }
};

/**
 * PATCH /api/items/:id
 * Update an existing report (Author or Admin or status change)
 */
export const updateItem = async (req, res, next) => {
  let newUploadedImage = null;

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Item not found. Invalid identifier.',
      });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    const isCreator = item.createdBy.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    const isStatusUpdateOnly =
      req.body.status &&
      Object.keys(req.body).filter((k) => k !== 'status').length === 0;

    // Only allow creator or admin to update details; allowed status update for claims
    if (!isCreator && !isAdmin && !isStatusUpdateOnly) {
      if (req.file) {
        removeUploadedFile(`/uploads/${req.file.filename}`);
      }
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not authorized to edit this report.',
      });
    }

    if (req.file) {
      newUploadedImage = `/uploads/${req.file.filename}`;
      // Remove old image if hosted locally
      if (item.image && item.image.startsWith('/uploads/')) {
        removeUploadedFile(item.image);
      }
      item.image = newUploadedImage;
    }

    // Apply allowed field updates
    const updatableFields = [
      'title',
      'category',
      'description',
      'location',
      'date',
      'status',
      'currentLocation',
      'contact',
    ];

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        if (field === 'category' && !CATEGORIES.includes(req.body[field])) {
          return res.status(400).json({ success: false, message: 'Invalid category' });
        }
        if (field === 'location' && !LOCATIONS.includes(req.body[field])) {
          return res.status(400).json({ success: false, message: 'Invalid location' });
        }
        if (field === 'status' && !STATUSES.includes(req.body[field])) {
          return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        item[field] = req.body[field];
      }
    }

    const updatedItem = await item.save();
    await updatedItem.populate('createdBy', 'name email role avatar');

    return res.json({
      success: true,
      message: 'Item updated successfully.',
      data: updatedItem,
    });
  } catch (err) {
    if (newUploadedImage) {
      removeUploadedFile(newUploadedImage);
    }
    next(err);
  }
};

/**
 * DELETE /api/items/:id
 * Delete a report (Creator or Admin only)
 */
export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Item not found. Invalid identifier.',
      });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    const isCreator = item.createdBy.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not authorized to delete this report.',
      });
    }

    // Clean up associated uploaded image file
    if (item.image && item.image.startsWith('/uploads/')) {
      removeUploadedFile(item.image);
    }

    await item.deleteOne();

    return res.json({
      success: true,
      message: 'Item deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
