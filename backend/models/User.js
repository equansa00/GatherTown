const mongoose = require('mongoose');
const bcrypt = require('bcrypt');  // For password hashing

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    verified: { type: Boolean, default: false },
    rsvpedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }], // Add this field
    resetPasswordToken: {
        type: String,
        select: false // This field should not be returned by default in queries
    },
    resetPasswordExpires: { 
        type: Date, 
        select: false 
    }
}, { timestamps: true });

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
