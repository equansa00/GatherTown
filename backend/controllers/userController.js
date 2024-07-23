// backend/controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
<<<<<<< HEAD
=======
const Event = require('../models/Event');
>>>>>>> 85374fba8fb4aa7e203b91076159c587744234ae
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');
const { authenticateUser } = require('../utils/authUtils');
const logger = require('../config/logger');

const { body, validationResult } = require('express-validator');

app.post('/api/events', [
  body('title').notEmpty().withMessage('Title is required'),
  body('date').isDate().withMessage('Invalid date'),
  // Add more validations as needed
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Proceed with event creation
});


const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

exports.registerUser = async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;
    logger.info('Registration Request:', { username, email, password, firstName, lastName });

    try {
        const userByEmail = await User.findOne({ email });
        const userByUsername = await User.findOne({ username });

        if (userByEmail) {
            logger.info(`Email already exists: ${email}`);
            return res.status(409).json({ msg: 'Email already exists' });
        }

        if (userByUsername) {
            logger.info(`Username already exists: ${username}`);
            return res.status(409).json({ msg: 'Username already exists' });
        }

        const user = new User({
            username,
            email,
            password, // Do not hash here; let the model handle it
            firstName,
            lastName,
            verified: true
        });

        logger.info('Saving user to database...');
        const savedUser = await user.save();
        logger.info('Saved User:', savedUser);

        const token = generateToken(savedUser._id.toString());
<<<<<<< HEAD
        logger.info('Generated Token:', token);
=======
        const refreshToken = generateRefreshToken(savedUser._id.toString());
>>>>>>> 85374fba8fb4aa7e203b91076159c587744234ae

        res.status(201).json({ user: savedUser, token, refreshToken });
    } catch (err) {
        logger.error('Registration error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ errors: err.errors });
        }
        res.status(500).send('Server error');
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
<<<<<<< HEAD
    logger.info('Login Request:', { email, password });

    try {
        const result = await authenticateUser(email, password);
        if (!result.success) {
            logger.info(`Authentication failed for ${email}: ${result.message}`);
            return res.status(result.message === 'Your account has not been verified.' ? 403 : 401).json({ message: result.message });
        }

        const { token, user } = result;
        logger.info('Login Successful:', { token, user });
=======
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "No account found with that email. Please register." });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      if (!user.verified) {
        return res.status(403).json({ message: "Your account has not been verified." });
      }
  
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
  
      res.json({ token, refreshToken, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
      console.error(`Login error for ${email}:`, error);
      res.status(500).json({ message: "Server error" });
    }
  };

exports.refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }
>>>>>>> 85374fba8fb4aa7e203b91076159c587744234ae

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const newToken = generateToken(decoded.id);
        res.json({ accessToken: newToken });
    } catch (error) {
<<<<<<< HEAD
        logger.error(`Login error for ${email}:`, error);
        res.status(500).json({ message: 'Server error' });
=======
        res.status(401).json({ message: 'Invalid refresh token' });
>>>>>>> 85374fba8fb4aa7e203b91076159c587744234ae
    }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            logger.info('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user,
            createdEvents: [], // Assuming some logic to fetch created events
            rsvpedEvents: []  // Assuming some logic to fetch RSVPed events
        });
    } catch (error) {
        logger.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
    const { firstName, lastName } = req.body;
    logger.info('Update User Profile Request:', { firstName, lastName });

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { firstName, lastName },
            { new: true, runValidators: true }
        );

        logger.info('Updated User:', user);

        res.json(user.toObject());
    } catch (error) {
        logger.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// Change Password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    logger.info('Change Password Request:', { currentPassword, newPassword });

    try {
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            logger.info('Incorrect current password');
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user.id, { password: hashedNewPassword });

        logger.info('Password updated successfully');
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        logger.error('Error changing password:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;
    logger.info('Verify Email called with token:', token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            logger.info('User not found');
            return res.status(404).send('User not found.');
        }

        await User.findByIdAndUpdate(decoded.id, { verified: true });

        logger.info('Email successfully verified');
        res.send('Email successfully verified.');
    } catch (error) {
        logger.error('Error verifying email:', error);
        res.status(400).send('Invalid or expired link.');
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    logger.info('Forgot Password Request:', { email });

    try {
        const user = await User.findOne({ email });

        if (!user) {
            logger.info('No user with this email');
            return res.status(404).send('No user with this email.');
        }

        const token = crypto.randomBytes(20).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        await User.findByIdAndUpdate(user._id, {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: Date.now() + 24 * 60 * 60 * 1000
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested for a password reset. Please go to this link to reset your password: ${resetUrl}`,
            html: `You requested for a password reset. Please click on this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
        });

        logger.info('Password reset email sent');
        res.send('Password reset email sent.');
    } catch (error) {
        logger.error('Failed to send the password reset email:', error);
        res.status(500).send('Failed to send the password reset email.');
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    logger.info('Reset Password Request:', { token, password });

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            logger.info('Invalid or expired token');
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
        });

        logger.info('Password reset successful');
        res.status(200).json({ message: 'Password reset successful, you can now log in with the new password.' });
    } catch (err) {
        logger.error('Error during password reset:', err);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

























// //backend/controllers/userController.js
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const Event = require('../models/Event');
// const crypto = require('crypto');
// const { sendEmail } = require('../utils/sendEmail');
// const { authenticateUser } = require('../utils/authUtils');

// const generateToken = (userId) => {
//     return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
// };

// // Register User
// exports.registerUser = async (req, res) => {
//     const { username, email, password, firstName, lastName } = req.body;

//     console.log('Registration Request:', { username, email, password, firstName, lastName });

//     try {
//         const userByEmail = await User.findOne({ email });
//         const userByUsername = await User.findOne({ username });

//         if (userByEmail) {
//             console.log(`Email already exists: ${email}`);
//             return res.status(409).json({ msg: 'Email already exists' });
//         }

//         if (userByUsername) {
//             console.log(`Username already exists: ${username}`);
//             return res.status(409).json({ msg: 'Username already exists' });
//         }

//         console.log('Hashing password...');
//         const hashedPassword = await bcrypt.hash(password, 10);
//         console.log('Hashed Password:', hashedPassword);

//         const user = new User({
//             username,
//             email,
//             password: hashedPassword,
//             firstName,
//             lastName,
//             verified: true
//         });

//         console.log('Saving user to database...');
//         const savedUser = await user.save();
//         console.log('Saved User:', savedUser);

//         const token = generateToken(savedUser._id.toString());
//         console.log('Generated Token:', token);

//         res.status(201).json({ user: savedUser, token });
//     } catch (err) {
//         console.error('Registration error:', err);
//         if (err.name === 'ValidationError') {
//             return res.status(400).json({ errors: err.errors });
//         }
//         res.status(500).send('Server error');
//     }
// };

// // Login User
// exports.loginUser = async (req, res) => {
//     const { email, password } = req.body;

//     console.log('Login Request:', { email, password });

//     try {
//         const result = await authenticateUser(email, password);
//         if (!result.success) {
//             if (result.message === 'Your account has not been verified.') {
//                 console.log(`Authentication failed for ${email}: ${result.message}`);
//                 return res.status(403).json({ message: result.message });
//             } else {
//                 console.log(`Authentication failed for ${email}: ${result.message}`);
//                 return res.status(401).json({ message: result.message });
//             }
//         }

//         const { token, user } = result;
//         console.log('Login Successful:', { token, user });

//         res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
//     } catch (error) {
//         console.error(`Login error for ${email}:`, error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Get User Profile
// exports.getUserProfile = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id).select('-password');
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         res.json({
//             user,
//             createdEvents: [], // Assuming some logic to fetch created events
//             rsvpedEvents: []  // Assuming some logic to fetch RSVPed events
//         });
//     } catch (error) {
//         console.error('Error fetching user profile:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// };

// // Update User Profile
// exports.updateUserProfile = async (req, res) => {
//     const { name, email } = req.body;
//     console.log('Update User Profile Request:', { name, email });

//     try {
//         const user = await User.findByIdAndUpdate(
//             req.user.id,
//             { name, email },
//             { new: true, runValidators: true }
//         );

//         console.log('Updated User:', user);

//         res.json(user.toObject());
//     } catch (error) {
//         console.error('Error updating user profile:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// };

// // Change Password
// exports.changePassword = async (req, res) => {
//     const { currentPassword, newPassword } = req.body;
//     console.log('Change Password Request:', { currentPassword, newPassword });

//     try {
//         const user = await User.findById(req.user.id);
//         const isMatch = await bcrypt.compare(currentPassword, user.password);

//         if (!isMatch) {
//             console.log('Incorrect current password');
//             return res.status(400).json({ error: 'Incorrect current password' });
//         }

//         const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//         await User.findByIdAndUpdate(req.user.id, { password: hashedNewPassword });

//         console.log('Password updated successfully');
//         res.json({ message: 'Password updated successfully' });
//     } catch (error) {
//         console.error('Error changing password:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// };

// // Verify Email
// exports.verifyEmail = async (req, res) => {
//     const { token } = req.params;
//     console.log('Verify Email called with token:', token);

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findById(decoded.id);

//         if (!user) {
//             console.log('User not found');
//             return res.status(404).send('User not found.');
//         }

//         await User.findByIdAndUpdate(decoded.id, { verified: true });

//         console.log('Email successfully verified');
//         res.send('Email successfully verified.');
//     } catch (error) {
//         console.error('Error verifying email:', error);
//         res.status(400).send('Invalid or expired link.');
//     }
// };

// // Forgot Password
// exports.forgotPassword = async (req, res) => {
//     const { email } = req.body;
//     console.log('Forgot Password Request:', { email });

//     try {
//         const user = await User.findOne({ email });

//         if (!user) {
//             console.log('No user with this email');
//             return res.status(404).send('No user with this email.');
//         }

//         const token = crypto.randomBytes(20).toString('hex');
//         const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//         await User.findByIdAndUpdate(user._id, {
//             resetPasswordToken: hashedToken,
//             resetPasswordExpires: Date.now() + 24 * 60 * 60 * 1000
//         });

//         const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

//         await sendEmail({
//             to: user.email,
//             subject: 'Password Reset Request',
//             text: `You requested for a password reset. Please go to this link to reset your password: ${resetUrl}`,
//             html: `You requested for a password reset. Please click on this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
//         });

//         console.log('Password reset email sent');
//         res.send('Password reset email sent.');
//     } catch (error) {
//         console.error('Failed to send the password reset email:', error);
//         res.status(500).send('Failed to send the password reset email.');
//     }
// };

// // Reset Password
// exports.resetPassword = async (req, res) => {
//     const { token } = req.params;
//     const { password } = req.body;
//     console.log('Reset Password Request:', { token, password });

//     try {
//         const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
//         const user = await User.findOne({
//             resetPasswordToken: hashedToken,
//             resetPasswordExpires: { $gt: Date.now() }
//         });

//         if (!user) {
//             console.log('Invalid or expired token');
//             return res.status(400).json({ message: 'Invalid or expired token.' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         await User.findByIdAndUpdate(user._id, {
//             password: hashedPassword,
//             resetPasswordToken: undefined,
//             resetPasswordExpires: undefined
//         });

//         console.log('Password reset successful');
//         res.status(200).json({ message: 'Password reset successful, you can now log in with the new password.' });
//     } catch (err) {
//         console.error('Error during password reset:', err);
//         res.status(500).json({ message: 'Error resetting password' });
//     }
// };
