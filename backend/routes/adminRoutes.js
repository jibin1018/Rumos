// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(authenticateUser, isAdmin);

// Dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// Agent verification
router.get('/agents/pending', adminController.getPendingAgents);
router.put('/agents/:id/verify', adminController.verifyAgent);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/agents', adminController.getAllAgents);
router.delete('/users/:id', adminController.deleteUser);

// Category management
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

module.exports = router;
