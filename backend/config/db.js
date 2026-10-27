import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose.
 * Falls back to local MongoDB instance if MONGODB_URI is not provided.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lostandfound';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database] MongoDB connection failed: ${error.message}`);
    console.warn(`[Database] Please verify MongoDB is running or configure MONGODB_URI in backend/.env`);
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection lost.');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB error event:', err.message);
});
