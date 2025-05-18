// backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { isAgent } = require('../middleware/roleMiddleware');

// All contact routes require authentication
router.use(authenticateUser);

// Create contact request
router.post('/:propertyId', contactController.createContactRequest);

// Get user's contact requests
router.get('/user', contactController.getUserContactRequests);

// Get agent's contact requests
router.get('/agent', isAgent, contactController.getAgentContactRequests);

// Mark contact request as read
router.put('/:requestId/read', isAgent, contactController.markAsRead);

// Delete contact request
router.delete('/:requestId', contactController.deleteContactRequest);

module.exports = router;
