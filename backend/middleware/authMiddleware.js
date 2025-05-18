// backend/middleware/authMiddleware.js
const { verifyToken } = require('../utils/jwtGenerator');

// Middleware to verify JWT token
const authenticateUser = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token required' });
        }
        
        // Get token from header
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authorization token required' });
        }
        
        // Verify token
        const decoded = verifyToken(token);
        
        // Add user info to request
        req.user = decoded;
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = {
    authenticateUser
};
