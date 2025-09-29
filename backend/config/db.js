const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("process.env.MONGO_URI",process.env.MONGO_URI);
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error('❌ MongoDB Connection Error: MONGO_URI is not defined in environment variables');
      return false;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // In serverless, we don't want to exit the process
    return false;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

module.exports = connectDB;