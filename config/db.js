import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    // Add more detailed error handling
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Print more detailed error information
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Check network or credentials.');
    }
    process.exit(1);
  }
};