// backend/controllers/favoriteController.js
const favoriteModel = require('../models/favoriteModel');
const propertyModel = require('../models/propertyModel');

// Controller functions for favorite routes
const favoriteController = {
    // Get user favorites
    getUserFavorites: async (req, res) => {
        try {
            const userId = req.user.id;
            
            const favorites = await favoriteModel.getUserFavorites(userId);
            
            res.status(200).json({ favorites });
        } catch (error) {
            console.error('Error getting user favorites:', error);
            res.status(500).json({ message: 'Error getting user favorites' });
        }
    },
    
    // Check if property is favorite
    checkFavorite: async (req, res) => {
        try {
            const userId = req.user.id;
            const { propertyId } = req.params;
            
            const isFavorite = await favoriteModel.isFavorite(userId, propertyId);
            
            res.status(200).json({ isFavorite });
        } catch (error) {
            console.error('Error checking favorite status:', error);
            res.status(500).json({ message: 'Error checking favorite status' });
        }
    },
    
    // Add property to favorites
    addFavorite: async (req, res) => {
        try {
            const userId = req.user.id;
            const { propertyId } = req.params;
            
            // Check if property exists
            const property = await propertyModel.getPropertyById(propertyId);
            
            if (!property) {
                return res.status(404).json({ message: 'Property not found' });
            }
            
            // Add to favorites
            const result = await favoriteModel.addFavorite(userId, propertyId);
            
            if (result.already_exists) {
                return res.status(200).json({ message: 'Property already in favorites' });
            }
            
            res.status(201).json({
                message: 'Property added to favorites',
                favorite: result
            });
        } catch (error) {
            console.error('Error adding to favorites:', error);
            res.status(500).json({ message: 'Error adding to favorites' });
        }
    },
    
    // Remove property from favorites
    removeFavorite: async (req, res) => {
        try {
            const userId = req.user.id;
            const { propertyId } = req.params;
            
            const removed = await favoriteModel.removeFavorite(userId, propertyId);
            
            if (!removed) {
                return res.status(404).json({ message: 'Property not found in favorites' });
            }
            
            res.status(200).json({
                message: 'Property removed from favorites',
                favorite: removed
            });
        } catch (error) {
            console.error('Error removing from favorites:', error);
            res.status(500).json({ message: 'Error removing from favorites' });
        }
    }
};

module.exports = favoriteController;
