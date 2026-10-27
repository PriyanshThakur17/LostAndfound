import express from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/itemController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadItemImage } from '../middleware/upload.js';

const router = express.Router();

/**
 * Shared Item CRUD Routes:
 * - GET    /api/items      : List items with filters (type, category, location, status, q, sort)
 * - GET    /api/items/:id  : Get single item by ID
 * - POST   /api/items      : Create new item (Protected, Multer image upload)
 * - PATCH  /api/items/:id  : Update item (Protected: creator/admin/status change)
 * - DELETE /api/items/:id  : Delete item (Protected: creator/admin)
 */

router.get('/', getItems);
router.get('/:id', getItemById);

router.post('/', uploadItemImage, authenticate, createItem);
router.patch('/:id', uploadItemImage, authenticate, updateItem);
router.delete('/:id', authenticate, deleteItem);

export default router;
