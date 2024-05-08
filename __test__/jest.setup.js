// __tests__/setup.js

// Importing required modules
require('dotenv').config(); // Module to load environment variables from a .env file into process.env
const mongoose = require('mongoose'); // MongoDB object modeling tool

// This module exports an async function that sets up the global test environment
module.exports = async () => {
  // Log the start of the setup process
  console.log('Global test setup: Connecting to MongoDB...');

  // Connect to the MongoDB database using the URI provided in the environment variables
  // The options object passed to mongoose.connect() is to avoid deprecation warnings
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, // Use the new MongoDB Node.js driver connection string parser
    useUnifiedTopology: true // Use the new MongoDB topology engine
  });
}