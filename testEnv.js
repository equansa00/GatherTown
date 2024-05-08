//home/equansa00/Desktop/GatherTown/testEnv.js
require('dotenv').config();

console.log('Loading environment variables...');
if (process.env.MONGO_URI && process.env.JWT_SECRET) {
    console.log('Environment variables loaded successfully.');
    console.log('MongoDB URI:', process.env.MONGO_URI);
    console.log('JWT Secret:', process.env.JWT_SECRET);
} else {
    console.log('Error loading environment variables.');
}
