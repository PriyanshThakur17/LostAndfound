// ============================================
// Campus Lost & Found Registry — Express Server
// ============================================
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import itemRoutes from './routes/itemRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import authRoutes from './routes/authRoutes.js';
import Item from './models/Item.js';
import { sampleItems } from '../src/data/sampleItems.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(async (conn) => {
  if (conn) {
    try {
      const count = await Item.countDocuments();
      if (count === 0) {
        console.log('[MongoDB] Seeding initial sample items into database...');
        // Strip out the mock numerical IDs so Mongo generates valid ObjectIds
        const cleanSampleItems = sampleItems.map(({ id: _id, ...rest }) => rest);
        await Item.insertMany(cleanSampleItems);
        console.log(`[MongoDB] Successfully seeded ${cleanSampleItems.length} items.`);
      }
    } catch (seedErr) {
      console.warn('[MongoDB Warning] Could not seed sample items:', seedErr.message);
    }
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded images
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Campus Lost & Found Registry API',
  });
});

// Centralized error handling middleware
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Lost & Found API Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

export default app;
