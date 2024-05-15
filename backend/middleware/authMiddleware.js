const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  console.log('Auth middleware triggered. Headers:', req.headers);
  const header = req.headers.authorization;

  if (!header) {
    console.log('Authorization header is missing');
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const token = header.split(' ')[1]; // Bearer <token>
  console.log(`Extracted Token: ${token}`);

  if (!token) {
    console.log('No token provided.');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Token decoded successfully: ${JSON.stringify(decoded)}`);

    const userId = decoded.id || decoded.user?.id;
    if (!userId) {
      console.log('Invalid token structure:', decoded);
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log(`No user found with ID: ${userId}`);
      return res.status(401).json({ error: 'User not found with this token' });
    }

    console.log(`User retrieved from database: ${user.username}`);
    req.user = user; // Storing the entire user object in req.user for use in routes
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token', details: error.message });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired', expired: true });
    }
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = authMiddleware;















//old middleware
// //backend/middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authMiddleware = async (req, res, next) => {
//     console.log('Auth middleware triggered. Headers:', req.headers);
//     const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
//     console.log(`Extracted Token: ${token}`);

//     if (!token) {
//         console.log('No token provided.');
//         return res.status(401).json({ error: 'No token provided' });
//     }

//     try {
//         console.log(`JWT Secret used for verification: ${process.env.JWT_SECRET || jwtSecret}`);
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || jwtSecret);
//         console.log(`Token decoded successfully: ${JSON.stringify(decoded)}`);

//         const userId = decoded.id || decoded.user?.id;

//         if (!userId) {
//             console.log('Invalid token structure:', decoded);
//             return res.status(401).json({ error: 'Invalid token structure' });
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             console.log(`No user found with ID: ${userId}`);
//             return res.status(401).json({ error: 'User not found with this token' });
//         }

//         console.log(`User retrieved from database: ${user.username}`);
//         req.user = user; // Storing the entire user object in req.user for use in routes
//         next();
//     } catch (error) {
//         console.error('Token validation error:', error);
//         return res.status(401).json({ error: 'Invalid token', details: error.message });
//     }
// };

// module.exports = authMiddleware;
