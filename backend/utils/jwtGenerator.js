// backend/utils/jwtGenerator.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'rumos_super_secret_key'; // Should be in .env file

// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, jwtSecret);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

module.exports = {
    generateToken,
    verifyToken
};
