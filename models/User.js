//home/equansa00/Desktop/GatherTown/models/User.js
// Importing the mongoose module
const mongoose = require('mongoose');

// Defining the User schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true }, // Username field, required and must be a string
    email: { type: String, required: true, unique: true }, // Email field, required, must be a string, and unique among all users
    password: { type: String, required: true }, // Password field, required and must be a string
    verified: { type: Boolean, default: false }, // Verified field, a boolean indicating whether the user's email has been verified, defaults to false
    resetPasswordToken: String, // This field stores the reset token when a user requests to reset their password
    resetPasswordExpire: Date  // This field stores the expiration time of the reset token
});

// Exporting the User model
module.exports = mongoose.model('User', UserSchema);