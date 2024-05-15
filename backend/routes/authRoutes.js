// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { oauth2Client } = require('../utils/sendEmail');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Route handler for OAuth2 callback
router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    console.log("No authorization code provided in request.");
    return res.status(400).send('Authorization code missing');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log("Access Token:", tokens.access_token);
    if (tokens.refresh_token) {
      console.log("Refresh Token:", tokens.refresh_token);
    } else {
      console.log("No Refresh Token received with tokens.");
    }

    res.send('Authentication successful! Tokens have been received and set.');
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send('Authentication error');
  }
});

// @route    POST api/auth/register
// @desc     Register user
// @access   Public
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  userController.registerUser
);

// Login user route
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  userController.loginUser
);

// @route    POST api/auth/refresh-token
// @desc     Refresh JWT token
// @access   Public
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
