// =============================================================================
// Campus Lost & Found Registry — Central Database Connection
// Author: Parth | Roll Number: 2410998556 (Member 4)
// Responsibility: Fail-Fast MongoDB Connection & Mongoose Configuration
// Database Target: campus_lost_found (127.0.0.1:27017)
// =============================================================================

import mongoose from 'mongoose';

/**
 * Connects to MongoDB using MONGODB_URI or MONGO_URI env variable.
 * Defaults to the Member 3 local instance: mongodb://127.0.0.1:27017/campus_lost_found
 *
 * @returns {Promise<typeof mongoose | null>}
 */
export const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/campus_lost_found';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[DB] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[DB] MongoDB connection failed: ${error.message}`);
    console.warn(`[DB] Please ensure MongoDB is running at ${uri}`);
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB connection lost.');
});

mongoose.connection.on('error', (err) => {
  console.error('[DB] MongoDB error event:', err.message);
});

export default connectDB;
