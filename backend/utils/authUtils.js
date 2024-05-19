//backend/utils/authUtils.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { connectDB } = require('../db');
const { oauth2Client } = require('../config/config');

const dbURI = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

async function authenticateUser(email, password) {
  console.log('Starting authentication process for user:', email);
  try {
    console.log('Connecting to MongoDB...');
    await connectDB(); 
    console.log('MongoDB connected.');

    console.log('Searching for user in database...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('No user found with that email:', email);
      return { success: false, message: 'Invalid credentials' };
    }

    if (!user.verified) {
      console.log('User found but not verified:', email);
      return { success: false, message: 'Authentication failed, user not found or not verified' };
    }

    console.log(`User found: ${user.email}`);
    console.log(`Stored hash: ${user.password}`);

    console.log('Comparing password with stored hash...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password comparison result for ${user.email}: ${isMatch}`);

    if (!isMatch) {
      console.log('Password does not match.');
      return { success: false, message: 'Invalid credentials' };
    }

    console.log('Generating JWT token...');
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log(`JWT generated successfully for ${user.email}: ${token}`);

    console.log('Returning result...');
    return { success: true, token, user };

  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Server error' };
  }
}

// Function to list all user email-password pairs
async function listAllHashes() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB(); 
    console.log('MongoDB connected.');

    console.log('Fetching all users...');
    const users = await User.find({}, 'email password'); // Only get the email and password fields
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`User ${index + 1}: Email: ${user.email}, Password Hash: ${user.password}`);
      });
    }
  } catch (error) {
    console.error('Error listing all hashes:', error);
  }
}



module.exports = { authenticateUser, listAllHashes };



// async function refreshAccessToken() {
//   console.log("Attempting to refresh the access token...");
//   try {
//       const { credentials } = await oauth2Client.refreshAccessToken();
//       if (credentials) {
//           oauth2Client.setCredentials(credentials);
//           console.log("Access token refreshed successfully:", credentials.access_token);
//           return credentials.access_token;
//       } else {
//           console.error("No credentials returned on refresh.");
//           throw new Error("No credentials returned on refresh.");
//       }
//   } catch (error) {
//       console.error("Failed to refresh access token:", error);
//       console.log("Error details:", error.response?.data || error.message);

//       if (error.response?.data.error === 'invalid_grant') {
//           // Specific handling for invalid grant error
//           console.error("Refresh token is expired or revoked. User needs to reauthenticate.");
//           throw new Error('Reauthentication required');
//       }

//       throw new Error('Failed to refresh access token.');
//   }
// }


// module.exports = { authenticateUser, listAllHashes,  refreshAccessToken };


















// //home/equansa00/Desktop/GatherTown/utils/authUtils.js
// // /utils/authUtils.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { connectDB } = require('../db');

// const dbURI = process.env.MONGO_URI;
// const jwtSecret = process.env.JWT_SECRET;

// async function authenticateUser(email, password) {
//     console.log('Starting authentication process for user:', email);
//     try {
//         console.log('Connecting to MongoDB...');
//         await connectDB(); 
//         console.log('MongoDB connected.');

//         console.log('Searching for user in database...');
//         const user = await User.findOne({ email });
//         if (!user) {
//             console.log('No user found with that email:', email);
//             return { success: false, message: 'Invalid credentials' };
//         }

//         if (!user.verified) {
//             console.log('User found but not verified:', email);
//             return { success: false, message: 'Authentication failed, user not found or not verified' };
//         }

//         console.log(`User found: ${user.email}`);
//         console.log(`Stored hash: ${user.password}`);

//         console.log('Comparing password with stored hash...');
//         const isMatch = await bcrypt.compare(password, user.password);
//         console.log(`Password comparison result for ${user.email}: ${isMatch}`);

//         if (!isMatch) {
//             console.log('Password does not match.');
//             return { success: false, message: 'Invalid credentials' };
//         }

//         console.log('Generating JWT token...');
//         const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         console.log(`JWT generated successfully for ${user.email}: ${token}`);

//         console.log('Returning result...');
//         return { success: true, token };

//     } catch (error) {
//         console.error('Login error:', error);
//         return { success: false, message: 'Server error' };
//     }
// }

// // Function to list all user email-password pairs
// async function listAllHashes() {
//     try {
//         console.log('Connecting to MongoDB...');
//         await connectDB(); 
//         console.log('MongoDB connected.');

//         console.log('Fetching all users...');
//         const users = await User.find({}, 'email password'); // Only get the email and password fields
//         if (users.length === 0) {
//             console.log('No users found in the database.');
//         } else {
//             users.forEach((user, index) => {
//                 console.log(`User ${index + 1}: Email: ${user.email}, Password Hash: ${user.password}`);
//             });
//         }
//     } catch (error) {
//         console.error('Error listing all hashes:', error);
//     }
// }

// module.exports = { authenticateUser, listAllHashes };
































// //old authenticateUser function
// async function authenticateUser(email, password) {
//     console.log('Starting authentication process for user:', email);
//     try {
//         console.log('Connecting to MongoDB...');
//         await connectDB(); 
//         console.log('MongoDB connected.');

//         console.log('Searching for user in database...');
//         const user = await User.findOne({ email });
//         if (!user) {
//             console.log('No user found with that email:', email);
//             return { success: false, message: 'Invalid credentials' };
//         }

//         console.log(`User found: ${user.email}`);
//         console.log(`Stored hash: ${user.password}`);

//         console.log('Comparing password with stored hash...');
//         const isMatch = await bcrypt.compare(password, user.password);
//         console.log(`Password comparison result for ${user.email}: ${isMatch}`);

//         if (!isMatch) {
//             console.log('Password does not match.');
//             return { success: false, message: 'Invalid credentials' };
//         }

//         console.log('Generating JWT token...');
//         const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
//         console.log(`JWT generated successfully for ${user.email}: ${token}`);
        
//         console.log('Returning result...');
//         return { success: true, token };

//     } catch (error) {
//         console.error('Login error:', error);
//         return { success: false, message: 'Server error' };
//     }
// }
