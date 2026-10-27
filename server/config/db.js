// ============================================
// Database Connection Configuration (MongoDB / Mongoose)
// ============================================
import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lostandfound';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${mongoURI}: ${err.message}`);
    console.warn(`[MongoDB Warning] Running with offline data resilience. Start MongoDB Compass / mongod on port 27017 to persist live database records.`);
    return null;
  }
};

export default connectDB;
