// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { isAdmin, isSameUser } = require('../middleware/roleMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes - requires authentication
router.get('/profile', authenticateUser, userController.getProfile);
router.put('/profile', authenticateUser, userController.updateProfile);

// Admin routes - requires admin role
router.get('/', authenticateUser, isAdmin, userController.getAllUsers);
router.get('/:id', authenticateUser, isAdmin, userController.getUserById);

// Delete user - either admin or the same user
router.delete('/:id', authenticateUser, isSameUser, userController.deleteUser);

module.exports = router;
