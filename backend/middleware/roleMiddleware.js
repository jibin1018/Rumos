// backend/middleware/roleMiddleware.js
// Middleware to check if user has required role
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'User not authorized for this action' });
        }
        
        next();
    };
};

// Middleware to check if user is an agent
const isAgent = (req, res, next) => {
    return checkRole(['agent', 'admin'])(req, res, next);
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    return checkRole(['admin'])(req, res, next);
};

// Middleware to check if user is accessing their own resource
const isSameUser = (req, res, next) => {
    const requestedUserId = parseInt(req.params.id || req.params.userId);
    
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Admin can access any user's resources
    if (req.user.role === 'admin') {
        return next();
    }
    
    // Check if user is accessing their own resource
    if (req.user.id !== requestedUserId) {
        return res.status(403).json({ message: 'Not authorized to access this resource' });
    }
    
    next();
};

module.exports = {
    checkRole,
    isAgent,
    isAdmin,
    isSameUser
};
