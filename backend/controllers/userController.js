const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');
const { authenticateUser, listAllHashes } = require('../utils/authUtils');


// Register a new user
exports.registerUser = async (req, res) => {
    const { email, password, username } = req.body;
    console.log(`Attempting to register user: ${email}`);

    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log(`User already exists with email: ${email}`);
            return res.status(409).json({ msg: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user and set verified to true
        user = new User({
            username,
            email,
            password: hashedPassword,
            verified: true  
        });

        await user.save();
        console.log(`New user registered successfully: ${email}`);

        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: 3600 });
        res.status(201).json({ user: user, token: token });
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).send('Server error');
    }
};


// Function to log in a user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login request received: ${email}`);
    
    try {
        const authResult = await authenticateUser(email, password);
        
        if (authResult.success) {
            res.status(200).json({ token: authResult.token });
        } else {
            res.status(401).json({ message: authResult.message });
        }
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.listAllUserHashes = async (req, res) => {
    await listAllHashes(); // Logs all users' email-hash pairs to the console
    res.status(200).json({ message: 'User hashes listed in console for debugging' });
};

// Function to get a single user by ID
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Server error');
    }
};

// Function to get user details authenticated by token
exports.getUserDetails = async (req, res) => {
    console.log('Fetching user details for ID:', req.user.id);
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Function to update a user
exports.updateUser = async (req, res) => {
    const { username, email, password } = req.body;
    const updates = { username, email };

    // Handle password updates with hashing
    if (password) {
        try {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        } catch (error) {
            console.error('Password hashing error:', error);
            return res.status(500).json({ message: 'Failed to update password' });
        }
    }

    try {
        // Ensure the update does not inadvertently set undefined fields
        const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).send('Server error');
    }
};


// Function to delete a user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).send('Server error');
    }
};

// Function to handle forgot password requests
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    console.log(`Forgot password request for email: ${email}`);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`No account found with email: ${email}`);
            return res.status(404).json({ message: 'No account with this email found.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour from now
        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/api/users/reset-password/${resetToken}`;
        const message = `Please make a PUT request to: ${resetUrl}`;
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Token',
            text: message
        });

        res.status(200).json({ message: 'Email sent.' });
    } catch (error) {
        console.error(`Error processing forgot password for ${email}:`, error);
        res.status(500).json({ message: 'Email could not be sent.' });
    }
};

// Function to reset a user's password
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful, you can now login with the new password.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

// Function to verify user email
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
