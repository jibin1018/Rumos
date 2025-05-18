// backend/routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateUser } = require('../middleware/authMiddleware');

// All favorite routes require authentication
router.use(authenticateUser);

// Get user favorites
router.get('/', favoriteController.getUserFavorites);

// Check if property is in favorites
router.get('/:propertyId', favoriteController.checkFavorite);

// Add property to favorites
router.post('/:propertyId', favoriteController.addFavorite);

// Remove property from favorites
router.delete('/:propertyId', favoriteController.removeFavorite);

module.exports = router;
