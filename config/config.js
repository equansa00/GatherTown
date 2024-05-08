//home/equansa00/Desktop/GatherTown/config/config.js

require('dotenv').config();

const config = {
  jwtSecret: process.env.JWT_SECRET // Ensure that it matches the name in your .env file
};

module.exports = config;
