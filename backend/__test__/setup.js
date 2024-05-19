//home/equansa00/Desktop/GatherTown/__test__/setup.js
const mongoose = require('mongoose'); // MongoDB object modeling tool
const User = require('../models/User'); // User model
const { connectDB } = require('../db'); // Database connection function

// This module exports an async function that sets up the global test environment
module.exports = async () => {
    // Log the start of the setup process
    console.log('Starting test setup...');

    try {
        // Connect to the MongoDB database
        await connectDB();
        console.log('Connected to MongoDB');

        // Clear the Users collection in the database
        console.log('Clearing Users collection...');
        await User.deleteMany({});
        console.log('Users collection cleared');

        // Log the end of the setup process
        console.log('Finished test setup.');
    } catch (err) {
        // Log any errors that occur during the setup process
        console.error('Error during test setup:', err);
    }
};
