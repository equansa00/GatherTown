// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const authMiddleware = async (req, res, next) => {
    logger.info("Starting authentication middleware...");

    const authHeader = req.headers.authorization;
    logger.info("Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.info("Authorization header missing or malformed");
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    logger.info("Token received:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info("Decoded token:", decoded);

        const userId = decoded.id || decoded._id;
        logger.info("User ID from token:", userId);

        req.user = await User.findById(userId).select('-password');
        logger.info("User found:", req.user);

        if (!req.user) {
            logger.info("User not found in database");
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        logger.info("Authentication error:", error.message);
        logger.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;



















// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const logger = require('../config/logger');

// const authMiddleware = async (req, res, next) => {
//     logger.info("Starting authentication middleware...");

//     const authHeader = req.headers.authorization;
//     logger.info("Authorization header:", authHeader);

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         logger.info("Authorization header missing or malformed");
//         return res.status(401).json({ message: 'Authorization header missing or malformed' });
//     }

//     const token = authHeader.split(' ')[1];
//     logger.info("Token received:", token);

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         logger.info("Decoded token:", decoded);

//         const userId = decoded.id || decoded._id;
//         logger.info("User ID from token:", userId);

//         req.user = await User.findById(userId).select('-password');
//         logger.info("User found:", req.user);

//         if (!req.user) {
//             logger.info("User not found in database");
//             return res.status(401).json({ message: 'User not found' });
//         }

//         next();
//     } catch (error) {
//         logger.info("Authentication error:", error.message);
//         logger.error('Authentication error:', error);
//         res.status(401).json({ message: 'Invalid token' });
//     }
// };

// module.exports = authMiddleware;





















// ///home/equansa00/Downloads/GatherTown/backend/middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const logger = require('../config/logger');

// const authMiddleware = async (req, res, next) => {
//     console.log("Starting authentication middleware...");

//     const authHeader = req.headers.authorization;
//     console.log("Authorization header:", authHeader);

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         console.log("Authorization header missing or malformed");
//         return res.status(401).json({ message: 'Authorization header missing or malformed' });
//     }

//     const token = authHeader.split(' ')[1];
//     console.log("Token received:", token);

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         console.log("Decoded token:", decoded);

//         const userId = decoded.id || decoded._id;
//         console.log("User ID from token:", userId);

//         req.user = await User.findById(userId).select('-password');
//         console.log("User found:", req.user);

//         if (!req.user) {
//             console.log("User not found in database");
//             return res.status(401).json({ message: 'User not found' });
//         }

//         next();
//     } catch (error) {
//         console.log("Authentication error:", error.message);
//         logger.error('Authentication error:', error);
//         res.status(401).json({ message: 'Invalid token' });
//     }
// };

// module.exports = authMiddleware;








// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const logger = require('../config/logger');

// const authMiddleware = async (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ message: 'Authorization header missing or malformed' });
//     }

//     const token = authHeader.split(' ')[1];
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = await User.findById(decoded.id).select('-password');
//         if (!req.user) {
//             return res.status(401).json({ message: 'User not found' });
//         }
//         next();
//     } catch (error) {
//         logger.error('Authentication error:', error);
//         res.status(401).json({ message: 'Invalid token' });
//     }
// };

// module.exports = authMiddleware;






// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const logger = require('../config/logger');

// const authMiddleware = async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Authorization header missing or malformed' });
//   }

//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select('-password');
//     if (!req.user) {
//       return res.status(401).json({ message: 'User not found' });
//     }
//     next();
//   } catch (error) {
//     logger.error('Authentication error:', error);
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// module.exports = authMiddleware;


