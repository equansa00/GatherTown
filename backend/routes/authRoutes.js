const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');

router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
], userController.registerUser);

router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
], userController.loginUser);

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);

module.exports = router;




// // backend/routes/authRoutes.js
// const express = require('express');
// const router = express.Router();
// const { check } = require('express-validator');
// const userController = require('../controllers/userController');
// const authController = require('../controllers/authController');

// router.post('/register', [
//     check('username', 'Username is required').not().isEmpty(),
//     check('email', 'Please include a valid email').isEmail(),
//     check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
// ], userController.registerUser);

// router.post('/login', [
//     check('email', 'Please include a valid email').isEmail(),
//     check('password', 'Password is required').exists(),
// ], userController.loginUser);

// router.post('/forgot-password', userController.forgotPassword);
// router.post('/reset-password/:token', userController.resetPassword); // Updated route

// module.exports = router;
