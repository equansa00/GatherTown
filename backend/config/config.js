require('dotenv').config();

const config = {
    jwtSecret: process.env.JWT_SECRET,
    mongoUri: process.env.MONGO_URI  // Retain existing database configuration
};

module.exports = config;
