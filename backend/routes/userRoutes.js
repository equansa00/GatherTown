// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', userController.registerUser);

// User login
router.post('/login', userController.loginUser);

// Email verification
router.get('/verify-email/:token', userController.verifyEmail);

// Request password reset
router.post('/forgot-password', userController.forgotPassword);

// Perform password reset
router.post('/reset-password/:token', userController.resetPassword);

// Fetch user details authenticated by token
router.get('/details', authMiddleware, userController.getUserDetails);

// Fetch user info using JWT token (protected route)
console.log("Registering protected endpoint route...");
router.get('/protected_endpoint', authMiddleware, (req, res) => {
    res.json({
        message: "You have accessed a protected endpoint!",
        user: req.user
    });
});
console.log("Protected endpoint route registered successfully.");

// Fetch specific user details by ID (protected)
router.get('/:id', authMiddleware, userController.getUser);

// Update user details (protected)
router.put('/:id', authMiddleware, userController.updateUser);

// Delete a user (protected)
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;

