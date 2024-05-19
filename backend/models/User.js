//home/equansa00/Desktop/GatherTown/models/User.js
// Importing the mongoose module
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    verified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
