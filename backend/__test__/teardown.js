//home/equansa00/Desktop/GatherTown/__test__/teardown.js
const { disconnectDB } = require('../db'); // Database disconnection function

// This module exports an async function that tears down the global test environment
module.exports = async () => {
    // Log the start of the teardown process
    console.log('Global test teardown: Disconnecting from MongoDB...');

    // Disconnect from the MongoDB database
    await disconnectDB();

    // Log the end of the teardown process
    console.log('MongoDB disconnected.');
};