// backend/utils/listHashes.js
require('dotenv').config({ path: '/home/equansa00/Downloads/GatherTown/backend/.env' }); // Explicitly load environment variables from the .env file
const mongoose = require('mongoose');
const User = require('../models/User');

// Debug: Check if environment variables are loaded
console.log('process.env.MONGO_URI:', process.env.MONGO_URI);

async function listAllHashes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected.');

        console.log('Fetching all users...');
        const users = await User.find({}, 'email password'); // Only get the email and password fields
        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            users.forEach((user, index) => {
                console.log(`User ${index + 1}: Email: ${user.email}, Password Hash: ${user.password}`);
            });
        }

        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    } catch (error) {
        console.error('Error listing all hashes:', error);
    }
}

listAllHashes();

