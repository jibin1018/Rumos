// backend/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { isAgent, isAdmin } = require('../middleware/roleMiddleware');
const { handlePropertyImageUpload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/recent', propertyController.getRecentProperties);
router.get('/:id', propertyController.getPropertyById);
router.get('/agent/:id', propertyController.getPropertiesByAgentId);

// Protected routes - requires authentication and agent role
router.post('/', authenticateUser, isAgent, handlePropertyImageUpload, propertyController.createProperty);
router.put('/:id', authenticateUser, isAgent, handlePropertyImageUpload, propertyController.updateProperty);
router.put('/:id/thumbnail', authenticateUser, isAgent, propertyController.updatePropertyThumbnail);
router.delete('/:id/images/:imageId', authenticateUser, isAgent, propertyController.deletePropertyImage);
router.delete('/:id', authenticateUser, isAgent, propertyController.deleteProperty);

module.exports = router;
