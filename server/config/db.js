const mongoose = require('mongoose');

/**
 * Connect to MongoDB Community Server.
 * Intended connection URI: mongodb://127.0.0.1:27017/campus_lost_found
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_found';

  try {
    const conn = await mongoose.connect(uri);

    console.log(`[MongoDB] Connected to database: ${conn.connection.name} at ${conn.connection.host}:${conn.connection.port}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from server');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected to server');
});

module.exports = connectDB;
