const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { connectDB } = require('../db');
const logger = require('../config/logger');

async function authenticateUser(email, password) {
    logger.info('Starting authentication process for user:', email);

    try {
        logger.info('Connecting to MongoDB...');
        await connectDB();
        logger.info('MongoDB connected.');

        logger.info('Searching for user in database...');
        const user = await User.findOne({ email });
        if (!user) {
            logger.info('No user found with that email:', email);
            return { success: false, message: 'Invalid credentials' };
        }

        if (!user.verified) {
            logger.info('User found but not verified:', email);
            return { success: false, message: 'Authentication failed, user not found or not verified' };
        }

        logger.info(`User found: ${user.email}`);
        logger.info(`Stored hash: ${user.password}`);

        logger.info('Comparing password with stored hash...');
        const isMatch = await bcrypt.compare(password, user.password);
        logger.info(`Password comparison result for ${user.email}: ${isMatch}`);

        if (!isMatch) {
            logger.info('Password does not match.');
            return { success: false, message: 'Invalid credentials' };
        }

        logger.info('Generating JWT token...');
        const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
        logger.info(`JWT generated successfully for ${user.email}: ${token}`);

        logger.info('Returning result...');
        return { success: true, token, user };

    } catch (error) {
        logger.error('Login error:', error);
        return { success: false, message: 'Server error' };
    }
}

// Function to test bcrypt (if needed)
async function testBcrypt() {
    const password = 'password123';
    const storedHash = '$2b$10$sWGrYJ6QT.zB5KJSOu6m../lKlN4Z/m9Gd79ztHBGob78xstxH9xe';
    
    try {
        console.log('bcrypt version:', bcrypt.version);

        // Hash the password
        const newHash = await bcrypt.hash(password, 10);
        console.log('Newly hashed password:', newHash);

        // Extract the salt from the stored hash
        const salt = storedHash.substring(0, 29);
        console.log('Extracted salt:', salt);

        // Hash the password using the extracted salt
        const newHashWithSalt = await bcrypt.hash(password, salt);
        console.log('Newly hashed password using extracted salt:', newHashWithSalt);

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, storedHash);
        console.log('Password comparison result:', isMatch);

        return isMatch;
    } catch (error) {
        console.error('Error in bcrypt operations:', error);
        return false;
    }
}

module.exports = { authenticateUser, testBcrypt };

// Run the testBcrypt function if this script is run directly
if (require.main === module) {
    testBcrypt().then(result => {
        console.log('Test bcrypt comparison result:', result);
    });
}























// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { connectDB } = require('../db');
// const logger = require('../config/logger');

// async function authenticateUser(email, password) {
//     logger.info('Starting authentication process for user:', email);

//     try {
//         logger.info('Connecting to MongoDB...');
//         await connectDB();
//         logger.info('MongoDB connected.');

//         logger.info('Searching for user in database...');
//         const user = await User.findOne({ email });
//         if (!user) {
//             logger.info('No user found with that email:', email);
//             return { success: false, message: 'Invalid credentials' };
//         }

//         if (!user.verified) {
//             logger.info('User found but not verified:', email);
//             return { success: false, message: 'Authentication failed, user not found or not verified' };
//         }

//         logger.info(`User found: ${user.email}`);
//         logger.info(`Stored hash: ${user.password}`);

//         logger.info('Comparing password with stored hash...');
//         const isMatch = await bcrypt.compare(password, user.password);
//         logger.info(`Password comparison result for ${user.email}: ${isMatch}`);

//         if (!isMatch) {
//             logger.info('Password does not match.');
//             return { success: false, message: 'Invalid credentials' };
//         }

//         logger.info('Generating JWT token...');
//         const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         logger.info(`JWT generated successfully for ${user.email}: ${token}`);

//         logger.info('Returning result...');
//         return { success: true, token, user };

//     } catch (error) {
//         logger.error('Login error:', error);
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










// // backend/utils/authUtils.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { connectDB } = require('../db');

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
//         return { success: true, token, user };

//     } catch (error) {
//         console.error('Login error:', error);
//         return { success: false, message: 'Server error' };
//     }
// }















// //backend/utils/authUtils.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { connectDB } = require('../db');
// const { oauth2Client } = require('../config/config');

// const dbURI = process.env.MONGO_URI;
// const jwtSecret = process.env.JWT_SECRET;

// async function authenticateUser(email, password) {
//   console.log('Starting authentication process for user:', email);
//   try {
//     console.log('Connecting to MongoDB...');
//     await connectDB(); 
//     console.log('MongoDB connected.');

//     console.log('Searching for user in database...');
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log('No user found with that email:', email);
//       return { success: false, message: 'Invalid credentials' };
//     }

//     if (!user.verified) {
//       console.log('User found but not verified:', email);
//       return { success: false, message: 'Authentication failed, user not found or not verified' };
//     }

//     console.log(`User found: ${user.email}`);
//     console.log(`Stored hash: ${user.password}`);

//     console.log('Comparing password with stored hash...');
//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log(`Password comparison result for ${user.email}: ${isMatch}`);

//     if (!isMatch) {
//       console.log('Password does not match.');
//       return { success: false, message: 'Invalid credentials' };
//     }

//     console.log('Generating JWT token...');
//     const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     console.log(`JWT generated successfully for ${user.email}: ${token}`);

//     console.log('Returning result...');
//     return { success: true, token, user };

//   } catch (error) {
//     console.error('Login error:', error);
//     return { success: false, message: 'Server error' };
//   }
// }

// // Function to list all user email-password pairs
// async function listAllHashes() {
//   try {
//     console.log('Connecting to MongoDB...');
//     await connectDB(); 
//     console.log('MongoDB connected.');

//     console.log('Fetching all users...');
//     const users = await User.find({}, 'email password'); // Only get the email and password fields
//     if (users.length === 0) {
//       console.log('No users found in the database.');
//     } else {
//       users.forEach((user, index) => {
//         console.log(`User ${index + 1}: Email: ${user.email}, Password Hash: ${user.password}`);
//       });
//     }
//   } catch (error) {
//     console.error('Error listing all hashes:', error);
//   }
// }



// module.exports = { authenticateUser, listAllHashes };
