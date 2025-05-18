// backend/routes/boardRoutes.js
const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Public routes
router.get('/categories', boardController.getCategories);
router.get('/posts', boardController.getAllPosts);
router.get('/posts/:id', boardController.getPostById);

// Protected routes - requires authentication
router.post('/posts', authenticateUser, boardController.createPost);
router.put('/posts/:id', authenticateUser, boardController.updatePost);
router.delete('/posts/:id', authenticateUser, boardController.deletePost);

router.post('/posts/:postId/comments', authenticateUser, boardController.addComment);
router.put('/comments/:commentId', authenticateUser, boardController.updateComment);
router.delete('/comments/:commentId', authenticateUser, boardController.deleteComment);

router.get('/user/posts', authenticateUser, boardController.getUserPosts);

module.exports = router;
