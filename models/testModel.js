// Importing required modules
require('dotenv').config(); // Module to load environment variables from a .env file into process.env
const mongoose = require('mongoose'); // MongoDB object modeling tool
const User = require('./models/Users'); // User model

// Asynchronous function to test the database
async function testDB() {
  try {
    // Connecting to the MongoDB database using the URI provided in the environment variables
    // The options object passed to mongoose.connect() is to avoid deprecation warnings
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Use the new MongoDB Node.js driver connection string parser
      useUnifiedTopology: true // Use the new MongoDB topology engine
    });
    console.log('Connected to MongoDB');

    // Deleting all documents from the Users collection in the database
    // The result of the deleteMany operation is logged to the console
    const result = await User.deleteMany({});
    console.log('Result of deleteMany:', result);
  } catch (error) {
    // Logging any errors that occur during the test
    console.error('Error:', error);
  } finally {
    // Disconnecting from the MongoDB database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Calling the testDB function
testDB();