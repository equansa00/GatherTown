const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);

router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.put('/change-password', authMiddleware, userController.changePassword);

router.post('/refresh-token', userController.refreshToken);

module.exports = router;







// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');
// const authMiddleware = require('../middleware/authMiddleware');

// router.post('/register', userController.registerUser);
// router.post('/login', userController.loginUser);
// router.get('/verify-email/:token', userController.verifyEmail);
// router.post('/forgot-password', userController.forgotPassword);
// router.post('/reset-password/:token', userController.resetPassword);

// router.get('/details', authMiddleware, userController.getUserDetails);
// router.get('/protected_endpoint', authMiddleware, (req, res) => {
//     res.json({
//         message: "You have accessed a protected endpoint!",
//         user: req.user
//     });
// });
// router.get('/:id', authMiddleware, userController.getUser);
// router.put('/:id', authMiddleware, userController.updateUser);
// router.delete('/:id', authMiddleware, userController.deleteUser);

// module.exports = router;



// // backend/routes/userRoutes.js
// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');
// const authMiddleware = require('../middleware/authMiddleware');

// // Register a new user
// router.post('/register', userController.registerUser);

// // User login
// router.post('/login', userController.loginUser);

// // Email verification
// router.get('/verify-email/:token', userController.verifyEmail);

// // Request password reset
// router.post('/forgot-password', userController.forgotPassword);

// // Perform password reset
// router.post('/reset-password/:token', userController.resetPassword);

// // Fetch user details authenticated by token
// router.get('/details', authMiddleware, userController.getUserDetails);

// // Fetch user info using JWT token (protected route)
// console.log("Registering protected endpoint route...");
// router.get('/protected_endpoint', authMiddleware, (req, res) => {
//     res.json({
//         message: "You have accessed a protected endpoint!",
//         user: req.user
//     });
// });
// console.log("Protected endpoint route registered successfully.");

// // Fetch specific user details by ID (protected)
// router.get('/:id', authMiddleware, userController.getUser);

// // Update user details (protected)
// router.put('/:id', authMiddleware, userController.updateUser);

// // Delete a user (protected)
// router.delete('/:id', authMiddleware, userController.deleteUser);

// module.exports = router;

