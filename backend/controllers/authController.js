// backend/controllers/authController.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail'); // Assuming this sends emails

const FRONTEND_URL = process.env.FRONTEND_URL;  

// Function to generate a password reset token
const generatePasswordResetToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('No user found with that email.');
        }

        const token = generatePasswordResetToken();
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
        const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

        await sendEmail({
            to: user.email,
            subject: 'Password Reset',
            text: message
        });

        res.send('Password reset link sent to your email.');
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).send('Error sending password reset email.');
    }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).send('No user found with that email.');
      }

      const token = generatePasswordResetToken();
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
      const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

      await sendEmail({
          to: user.email,
          subject: 'Password Reset',
          text: message,
          html: `<p>${message}</p>`
      });

      res.send('Password reset email sent.');
  } catch (error) {
      console.error('Failed to send the password reset email:', error);
      res.status(500).send('Failed to send the password reset email.');
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;  // Make sure to get 'password' from the body

  console.log(`Incoming request to reset password with token: ${token}`);

  try {
      // Find the user by the reset token and check if the token hasn't expired
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
          console.log('Invalid or expired reset token');
          return res.status(400).send('Reset token is invalid or has expired.');
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user's password and clear the reset token fields
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.log(`Password has been successfully updated for user: ${user.email}`);
      res.status(200).send('Your password has been reset successfully.');
  } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).send('Failed to reset password. Please try again later.');
  }
};


