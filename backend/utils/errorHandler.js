// backend/utils/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Check if error has a status code, otherwise default to 500
    const statusCode = err.statusCode || 500;
    
    // Response
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;
