<<<<<<< HEAD
//home/equansa00/Downloads/GatherTown/backend/models/User.js
=======
>>>>>>> 85374fba8fb4aa7e203b91076159c587744234ae
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

<<<<<<< HEAD
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  profilePicture: {
    type: String,
    default: ''
  },
  interests: { type: [String] },
  eventsAttended: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  eventsOrganized: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  resetPasswordToken: {
    type: String,
    select: false 
  },
  resetPasswordExpires: { 
    type: Date, 
    select: false 
  }
});

// Middleware to hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
















// //backend/models/User.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const UserSchema = new mongoose.Schema({
//   username: { 
//     type: String, 
//     required: true, 
//     unique: true, 
//     trim: true 
//   },
//   email: { 
//     type: String, 
//     required: true, 
//     unique: true, 
//     trim: true 
//   },
//   password: { 
//     type: String, 
//     required: true 
//   },
//   firstName: { 
//     type: String, 
//     required: true 
//   },
//   lastName: { 
//     type: String, 
//     required: true 
//   },
//   verified: { 
//     type: Boolean, 
//     default: false 
//   },
//   resetPasswordToken: {
//     type: String,
//     select: false 
//   },
//   resetPasswordExpires: { 
//     type: Date, 
//     select: false 
//   }
// });

// // Middleware to hash password before saving
// UserSchema.pre('save', async function(next) {
//   console.log("Hashing password...");
//   if (this.isModified('password')) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   next();
// });

// // Method to compare passwords
// UserSchema.methods.comparePassword = async function(candidatePassword) {
//   console.log("Comparing passwords...");
//   return bcrypt.compare(candidatePassword, this.password);
// };

// // Method to generate JWT token
// UserSchema.methods.generateAuthToken = function() {
//   console.log("Generating auth token...");
//   const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   return token;
// };

// module.exports = mongoose.model('User', UserSchema);
=======
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
>>>>>>> 85374fba8fb4aa7e203b91076159c587744234ae
