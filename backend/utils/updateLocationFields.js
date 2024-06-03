const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '../.env');

console.log('Current directory:', __dirname);
console.log('Looking for .env file at:', envPath);
if (fs.existsSync(envPath)) {
  console.log('.env file exists');
} else {
  console.log('.env file does not exist');
}

require('dotenv').config({ path: envPath }); // Load environment variables from specific path

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../db');
const Event = require('../models/Event');

const updateLocationFields = async () => {
  try {
    await connectDB(); // Wait for the connection before proceeding

    await Event.updateMany(
      { "location.city": "Unknown" },
      { $set: { "location.city": "New York" } }
    );
    await Event.updateMany(
      { "location.state": "Unknown" },
      { $set: { "location.state": "NY" } }
    );
    await Event.updateMany(
      { "location.zipCode": "Unknown" },
      { $set: { "location.zipCode": "10001" } }
    );

    console.log('Location fields updated successfully');
    await disconnectDB();
  } catch (error) {
    console.error('Error updating location fields:', error);
    await disconnectDB();
  }
};

updateLocationFields();
