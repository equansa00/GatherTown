//home/equansa00/Desktop/GatherTown/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');  // For password hashing

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    verified: { type: Boolean, default: false },
    resetPasswordToken: {
        type: String,
        select: false // This field should not be returned by default in queries
    },
    resetPasswordExpires: { 
        type: Date, 
        select: false 
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
