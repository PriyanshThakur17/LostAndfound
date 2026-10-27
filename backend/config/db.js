// ============================================
// Campus Lost & Found — MongoDB Connection
// ============================================
// Owned by Member 4 (backend foundation).
// Member 3 verifies the local MongoDB setup.
// All backend modules must import this shared
// connection rather than calling mongoose.connect()
// themselves.
// ============================================

import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the MONGO_URI env variable.
 * Throws if the URI is missing or the connection fails,
 * so the server refuses to start silently in degraded mode.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      '[DB] MONGO_URI is not defined. ' +
        'Copy backend/.env.example to backend/.env and set a value.'
    );
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`);
    // Exit the process so the team knows immediately that the DB is unavailable.
    process.exit(1);
  }
};

export default connectDB;
