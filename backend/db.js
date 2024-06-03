require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

const connectDB = async () => {
  console.log("process.env object in db.js", process.env); // Check entire process.env
  console.log("MONGO_URI in db.js:", process.env.MONGO_URI); // Log MONGO_URI

  if (mongoose.connection.readyState === 0) {
    console.log('Attempting to connect to MongoDB...');
    try {
      await mongoose.connect(process.env.MONGO_URI, { // Explicitly access the variable
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB Connected');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    console.log('Disconnecting MongoDB...');
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

module.exports = { connectDB, disconnectDB };
