const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');

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

    try {
        const userByEmail = await User.findOne({ email });
        const userByUsername = await User.findOne({ username });

        if (userByEmail) {
            return res.status(409).json({ msg: 'Email already exists' });
        }

        if (userByUsername) {
            return res.status(409).json({ msg: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            verified: true
        });

        const savedUser = await user.save();
        const token = generateToken(savedUser._id.toString());
        const refreshToken = generateRefreshToken(savedUser._id.toString());

        res.status(201).json({ user: savedUser, token, refreshToken });
    } catch (err) {
        console.error('Registration error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ errors: err.errors });
        }
        res.status(500).send('Server error');
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
  
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

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const newToken = generateToken(decoded.id);
        res.json({ accessToken: newToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const createdEvents = await Event.find({ creator: req.user.id });
        const rsvpedEvents = await Event.find({ attendees: req.user.id });

        res.json({
            user,
            createdEvents,
            rsvpedEvents,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
    const { name, email } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).send('User not found.');
        }

        user.verified = true;
        await user.save();

        res.send('Email successfully verified.');
    } catch (error) {
        res.status(400).send('Invalid or expired link.');
    }
};

// Function to handle forgot password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('No user with this email.');
        }

        const token = crypto.randomBytes(20).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; 
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested for a password reset. Please go to this link to reset your password: ${resetUrl}`,
            html: `You requested for a password reset. Please click on this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
        });

        res.send('Password reset email sent.');
    } catch (error) {
        console.error('Failed to send the password reset email:', error);
        res.status(500).send('Failed to send the password reset email.');
    }
};

// Function to handle reset password
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful, you can now log in with the new password.' });
    } catch (err) {
        console.error('Error during password reset:', err);
        res.status(500).json({ message: 'Error resetting password' });
    }
};











// //backend/controllers/userController.js
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const crypto = require('crypto');
// const { sendEmail } = require('../utils/sendEmail');
// const { authenticateUser, listAllHashes } = require('../utils/authUtils');

// const generateToken = (userId) => {
//     return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
// };

// exports.registerUser = async (req, res) => {
//     const { username, email, password, firstName, lastName } = req.body;
//     console.log("Received registration request with data:", req.body);  // Log the incoming data

//     try {
//         // Check if email or username already exists in the database
//         const userByEmail = await User.findOne({ email });
//         const userByUsername = await User.findOne({ username });

//         if (userByEmail) {
//             return res.status(409).json({ msg: 'Email already exists' });
//         }

//         if (userByUsername) {
//             return res.status(409).json({ msg: 'Username already exists' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const user = new User({
//             username,
//             email,
//             password: hashedPassword,
//             firstName,
//             lastName,
//             verified: true
//         });

//         const savedUser = await user.save();
//         const token = generateToken(savedUser._id.toString());

//         res.status(201).json({ user: savedUser, token });
//     } catch (err) {
//         console.error('Registration error:', err);
//         if (err.name === 'ValidationError') {
//             return res.status(400).json({ errors: err.errors });
//         }
//         res.status(500).send('Server error');
//     }
// };


// // backend/controllers/userController.js
// exports.loginUser = async (req, res) => {
//     const { email, password } = req.body;
//     console.log(`Incoming request: POST /api/users/login`);
//     console.log(`Login request for email: ${email}`);

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             console.log(`No user found with email: ${email}`);
//             return res.status(404).json({ message: "No account found with that email. Please register." });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             console.log(`Invalid password for ${email}`);
//             return res.status(401).json({ message: "Invalid credentials" });
//         }

//         if (!user.verified) {
//             console.log(`User ${email} is not verified.`);
//             return res.status(403).json({ message: "Your account has not been verified." });
//         }

//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
//         console.log(`User ${email} logged in successfully.`);
//         console.log(`Token: ${token}`);
//         console.log(`User ID: ${user._id}`);

//         res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
//     } catch (error) {
//         console.error(`Login error for ${email}:`, error);
//         res.status(500).json({ message: "Server error" });
//     }
// };

// exports.listAllUserHashes = async (req, res) => {
//     await listAllHashes(); // Logs all users' email-hash pairs to the console
//     res.status(200).json({ message: 'User hashes listed in console for debugging' });
// };

// // Function to get a single user by ID
// exports.getUser = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user) {
//             return res.status(404).json({ msg: 'User not found' });
//         }

//         res.json(user);
//     } catch (error) {
//         console.error('Error fetching user:', error);
//         res.status(500).send('Server error');
//     }
// };

// // Function to get user details authenticated by token
// exports.getUserDetails = async (req, res) => {
//     console.log('Fetching user details for ID:', req.user.id);
//     try {
//         const user = await User.findById(req.user.id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(user);
//     } catch (error) {
//         console.error('Error fetching user details:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };


// // Function to update a user
// exports.updateUser = async (req, res) => {
//     const { username, email, password } = req.body;
//     const updates = { username, email };

//     // Handle password updates with hashing
//     if (password) {
//         try {
//             const salt = await bcrypt.genSalt(10);
//             updates.password = await bcrypt.hash(password, salt);
//         } catch (error) {
//             console.error('Password hashing error:', error);
//             return res.status(500).json({ message: 'Failed to update password' });
//         }
//     }

//     try {
//         // Ensure the update does not inadvertently set undefined fields
//         const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.status(200).json({ message: 'User updated successfully', user });
//     } catch (error) {
//         console.error('Update error:', error);
//         res.status(500).send('Server error');
//     }
// };


// // Function to delete a user
// exports.deleteUser = async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id);
//         if (!user) {
//             return res.status(404).json({ msg: 'User not found' });
//         }

//         res.json({ msg: 'User deleted' });
//     } catch (error) {
//         console.error('Delete error:', error);
//         res.status(500).send('Server error');
//     }
// };

// const FRONTEND_URL = process.env.FRONTEND_URL;

// const generatePasswordResetToken = () => {
//     return crypto.randomBytes(20).toString('hex');
// };

// exports.forgotPassword = async (req, res) => {
//     const { email } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).send('No user with this email.');
//         }

//         const token = crypto.randomBytes(20).toString('hex');
//         const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//         // Set a more reasonable expiration time (e.g., 1 day)
//         user.resetPasswordToken = hashedToken;
//         user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; 
//         await user.save();

//         console.log('Generated reset token:', token);
//         console.log('Hashed reset token:', hashedToken);
//         console.log('Reset token expires at:', user.resetPasswordExpires);
//         console.log('User after saving reset token:', user); // Log the entire user object for debugging

//         const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
//         await sendEmail({
//             to: user.email,
//             subject: 'Password Reset Request',
//             text: `You requested for a password reset. Please go to this link to reset your password: ${resetUrl}`,
//             html: `You requested for a password reset. Please click on this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
//         });

//         res.send('Password reset email sent.');
//     } catch (error) {
//         console.error('Failed to send the password reset email:', error);
//         res.status(500).send('Failed to send the password reset email.');
//     }
// };

// exports.resetPassword = async (req, res) => {
//     const { token } = req.params;
//     const { password } = req.body;

//     try {
//         const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
//         console.log('Hashed token for lookup:', hashedToken);

//         const user = await User.findOne({
//             resetPasswordToken: hashedToken,
//             resetPasswordExpires: { $gt: Date.now() }
//         });

//         console.log('User found during reset password:', user);

//         if (!user) {
//             return res.status(400).json({ message: 'Invalid or expired token.' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(password, salt);
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;
//         await user.save();

//         res.status(200).json({ message: 'Password reset successful, you can now log in with the new password.' });
//     } catch (err) {
//         console.error('Error during password reset:', err);
//         res.status(500).json({ message: 'Error resetting password' });
//     }
// };
// // Get user profile
// exports.getUserProfile = async (req, res) => {
//     try {
//       const user = await User.findById(req.user.id).select('-password');
//       const createdEvents = await Event.find({ creator: req.user.id });
//       const rsvpedEvents = await Event.find({ attendees: req.user.id });
  
//       res.json({
//         user,
//         createdEvents,
//         rsvpedEvents,
//       });
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       res.status(500).json({ error: 'Server error' });
//     }
//   };
  
//   // Update user profile
//   exports.updateUserProfile = async (req, res) => {
//     const { name, email } = req.body;
//     try {
//       const user = await User.findByIdAndUpdate(
//         req.user.id,
//         { name, email },
//         { new: true, runValidators: true }
//       ).select('-password');
//       res.json(user);
//     } catch (error) {
//       console.error('Error updating user profile:', error);
//       res.status(500).json({ error: 'Server error' });
//     }
//   };
  
//   // Change password
//   exports.changePassword = async (req, res) => {
//     const { currentPassword, newPassword } = req.body;
//     try {
//       const user = await User.findById(req.user.id);
//       const isMatch = await bcrypt.compare(currentPassword, user.password);
//       if (!isMatch) {
//         return res.status(400).json({ error: 'Incorrect current password' });
//       }
//       user.password = await bcrypt.hash(newPassword, 10);
//       await user.save();
//       res.json({ message: 'Password updated successfully' });
//     } catch (error) {
//       console.error('Error changing password:', error);
//       res.status(500).json({ error: 'Server error' });
//     }
//   };

// // Function to verify user email
// exports.verifyEmail = async (req, res) => {
//     try {
//         const { token } = req.params;
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findById(decoded.id);

//         if (!user) {
//             return res.status(404).send('User not found.');
//         }

//         user.verified = true;
//         await user.save();

//         res.send('Email successfully verified.');
//     } catch (error) {
//         res.status(400).send('Invalid or expired link.');
//     }
// };
