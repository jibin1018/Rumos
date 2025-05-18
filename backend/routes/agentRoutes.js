// backend/routes/agentRoutes.js
const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { isAdmin, isAgent } = require('../middleware/roleMiddleware');
const { handleLicenseImageUpload } = require('../middleware/uploadMiddleware');

// Register as an agent
router.post('/register', handleLicenseImageUpload, agentController.registerAgent);

// Protected routes - requires authentication and agent role
router.get('/profile', authenticateUser, isAgent, agentController.getAgentProfile);
router.put('/profile', authenticateUser, isAgent, handleLicenseImageUpload, agentController.updateAgentProfile);

// Get all agents (public)
router.get('/', agentController.getAllAgents);

// Get agent by ID (public)
router.get('/:id', agentController.getAgentById);

// Admin routes - requires admin role
router.get('/admin/pending', authenticateUser, isAdmin, agentController.getPendingAgents);
router.put('/admin/verify/:id', authenticateUser, isAdmin, agentController.verifyAgent);

module.exports = router;
