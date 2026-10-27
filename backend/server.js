// ============================================
// Campus Lost & Found Registry — Unified Express Server
// ============================================
// Database: campus_lost_found (Member 3 verified)
// Backend foundation: Member 4 + Member 1, 2, 3 integrated
// ============================================

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import itemRoutes from './routes/itemRoutes.js';
import authRoutes from './routes/authRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { UPLOAD_DIR } from './middleware/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Community Server (database: campus_lost_found)
connectDB();

// Global Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple cookie parsing middleware
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts[0]?.trim();
      const val = parts.slice(1).join('=').trim();
      if (name) {
        try {
          req.cookies[name] = decodeURIComponent(val);
        } catch {
          req.cookies[name] = val;
        }
      }
    });
  }
  next();
});

// Serve uploaded images statically
app.use('/uploads', express.static(UPLOAD_DIR));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: dbState === 1,
    status: 'healthy',
    server: 'running',
    database: dbStatus,
    dbName: 'campus_lost_found',
    timestamp: new Date().toISOString(),
    service: 'Campus Lost & Found Registry API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Centralized error handling
app.use(errorHandler);

// Start server only if executed directly as entry script
const isMain = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isMain && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Server] Campus Lost & Found API running on http://localhost:${PORT}`);
    console.log(`[Server] Connected database: ${mongoose.connection.name || 'campus_lost_found'}`);
  });
}

export default app;
