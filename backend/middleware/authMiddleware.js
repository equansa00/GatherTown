const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if authorization header is present and well-formed
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.error('Authorization header missing or malformed');
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Find the user by decoded ID, excluding the password field
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            logger.error('User not found for token');
            return res.status(401).json({ message: 'User not found' });
        }
        // Proceed to the next middleware
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        // Generic error response for other cases
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = authMiddleware;
