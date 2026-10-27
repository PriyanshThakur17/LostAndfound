require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route handlers
const itemRoutes = require('./routes/itemRoutes');
const claimRoutes = require('./routes/claimRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Community Server (database: campus_lost_found)
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'campus_lost_found',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/users', userRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`[Express] Campus Lost & Found backend listening on port ${PORT}`);
  console.log(`[Express] Connected to MongoDB: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_found'}`);
});

module.exports = { app, server };
