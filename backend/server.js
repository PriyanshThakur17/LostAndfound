// ============================================
// Campus Lost & Found — Express Server
// ============================================
// Member 4: backend foundation.
//
// Port 5000 (Vite frontend stays on 5173).
// ============================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// ----- Connect to MongoDB (fail-fast) -----
await connectDB();

// ----- App -----
const app = express();

// ----- CORS -----
// Credentials (cookies) require a specific origin — wildcard '*' won't work.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true, // allow cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ----- Body parsing -----
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ----- Cookie parsing -----
app.use(cookieParser());

// ----- Health check -----
// Useful for teammates to verify the server + DB are up.
app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  const httpStatus = dbState === 1 ? 200 : 503;

  res.status(httpStatus).json({
    success: dbState === 1,
    server: 'running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// ----- API Routes -----
app.use('/api/auth', authRoutes);

// Placeholder stub so Members 1, 2, 3 can register their routes here
// when they add them. Remove the comments and add imports accordingly.
// app.use('/api/items',  itemRoutes);   // Member 1 & 2
// app.use('/api/claims', claimRoutes);  // Member 2

// ----- Error handling (must be last) -----
app.use(notFound);
app.use(errorHandler);

// ----- Start -----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});
