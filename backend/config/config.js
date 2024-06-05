//backend/config/config.js
require('dotenv').config();

const config = {
    jwtSecret: process.env.JWT_SECRET,
    mongoUri: process.env.MONGO_URI  
};

module.exports = config;
