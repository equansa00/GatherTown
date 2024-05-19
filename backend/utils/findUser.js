// backend/utils/findUser.js
require('dotenv').config({ path: '/home/equansa00/Desktop/GatherTown/backend/.env' }); 

const mongoose = require('mongoose');
const User = require('../models/User');

// This line logs the MongoDB URI to the console to verify it's being loaded correctly.
console.log('URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB using URI:', process.env.MONGO_URI);
    findUser();
})
.catch(err => {
    console.log('Failed to connect to MongoDB:', err);
});

async function findUser() {
    const userEmail = 'nana1@gmail.com';
    const user = await User.findOne({ email: userEmail });
    console.log('Find result:', user);
    mongoose.disconnect(); // Disconnect from MongoDB after operation is complete.
}