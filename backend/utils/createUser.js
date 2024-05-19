//backend/utils/createUser.js
require('dotenv').config({ path: '/home/equansa00/Desktop/GatherTown/backend/.env' }); 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createUser() {
    try {
        // Connect to MongoDB using URI from environment variables
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');

        // Check if user already exists
        const existingUser = await User.findOne({ email: 'nana1@gmail.com' });
        if (existingUser) {
            console.log('User already exists!');
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create a new user
        const newUser = new User({
            username: 'nana1',
            email: 'nana1@gmail.com',
            password: hashedPassword,
            verified: true
        });

        // Save the new user to the database
        const user = await newUser.save();
        console.log('User created:', user);
    } catch (err) {
        console.error('Error connecting to MongoDB or creating user:', err);
    } finally {
        // Always disconnect from the database when done
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
}

createUser();
