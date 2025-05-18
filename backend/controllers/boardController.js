// backend/controllers/boardController.js
const boardModel = require('../models/boardModel');

// Controller functions for board routes
const boardController = {
    // Get all categories
    getCategories: async (req, res) => {
        try {
            const categories = await boardModel.getCategories();
            
            res.status(200).json({ categories });
        } catch (error) {
            console.error('Error getting categories:', error);
            res.status(500).json({ message: 'Error getting categories' });
        }
    },
    
    // Get all posts with pagination
    getAllPosts: async (req, res) => {
        try {
            const { page = 1, limit = 10, category_id } = req.query;
            const offset = (page - 1) * limit;
            
            const posts = await boardModel.getAllPosts(
                parseInt(limit),
                parseInt(offset),
                category_id ? parseInt(category_id) : null
            );
            
            const total = await boardModel.getPostCount(
                category_id ? parseInt(category_id) : null
            );
            
            res.status(200).json({
                posts,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting posts:', error);
            res.status(500).json({ message: 'Error getting posts' });
        }
    },
    
    // Get post by ID
    getPostById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const post = await boardModel.getPostById(id);
            
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            
            res.status(200).json({ post });
        } catch (error) {
            console.error('Error getting post:', error);
            res.status(500).json({ message: 'Error getting post' });
        }
    },
    
    // Create post
    createPost: async (req, res) => {
        try {
            const userId = req.user.id;
            const { category_id, title, content } = req.body;
            
            // Validate input
            if (!title || !content) {
                return res.status(400).json({ message: 'Title and content are required' });
            }
            
            const newPost = await boardModel.createPost({
                user_id: userId,
                category_id: category_id || null,
                title,
                content
            });
            
            res.status(201).json({
                message: 'Post created successfully',
                post: newPost
            });
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ message: 'Error creating post' });
        }
    },
    
    // Update post
    updatePost: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { category_id, title, content } = req.body;
            
            // Validate input
            if (!title || !content) {
                return res.status(400).json({ message: 'Title and content are required' });
            }
            
            // Get post to check ownership
            const post = await boardModel.getPostById(id);
            
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            
            // Check if user is the author or an admin
            if (post.user_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to update this post' });
            }
            
            const updatedPost = await boardModel.updatePost(id, {
                category_id: category_id || post.category_id,
                title,
                content
            });
            
            res.status(200).json({
                message: 'Post updated successfully',
                post: updatedPost
            });
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ message: 'Error updating post' });
        }
    },
    
    // Delete post
    deletePost: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            // Get post to check ownership
            const post = await boardModel.getPostById(id);
            
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            
            // Check if user is the author or an admin
            if (post.user_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to delete this post' });
            }
            
            await boardModel.deletePost(id);
            
            res.status(200).json({
                message: 'Post deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ message: 'Error deleting post' });
        }
    },
    
    // Add comment
    addComment: async (req, res) => {
        try {
            const { postId } = req.params;
            const userId = req.user.id;
            const { content } = req.body;
            
            // Validate input
            if (!content) {
                return res.status(400).json({ message: 'Comment content is required' });
            }
            
            // Check if post exists
            const post = await boardModel.getPostById(postId);
            
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            
            const newComment = await boardModel.addComment({
                post_id: postId,
                user_id: userId,
                content
            });
            
            res.status(201).json({
                message: 'Comment added successfully',
                comment: newComment
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).json({ message: 'Error adding comment' });
        }
    },
    
    // Update comment
    updateComment: async (req, res) => {
        try {
            const { commentId } = req.params;
            const userId = req.user.id;
            const { content } = req.body;
            
            // Validate input
            if (!content) {
                return res.status(400).json({ message: 'Comment content is required' });
            }
            
            // Get comment to check ownership
            const commentQuery = 'SELECT * FROM board_comments WHERE comment_id = $1';
            const commentResult = await db.query(commentQuery, [commentId]);
            
            if (commentResult.rows.length === 0) {
                return res.status(404).json({ message: 'Comment not found' });
            }
            
            const comment = commentResult.rows[0];
            
            // Check if user is the author or an admin
            if (comment.user_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to update this comment' });
            }
            
            const updatedComment = await boardModel.updateComment(commentId, content);
            
            res.status(200).json({
                message: 'Comment updated successfully',
                comment: updatedComment
            });
        } catch (error) {
            console.error('Error updating comment:', error);
            res.status(500).json({ message: 'Error updating comment' });
        }
    },
    
    // Delete comment
    deleteComment: async (req, res) => {
        try {
            const { commentId } = req.params;
            const userId = req.user.id;
            
            // Get comment to check ownership
            const commentQuery = 'SELECT * FROM board_comments WHERE comment_id = $1';
            const commentResult = await db.query(commentQuery, [commentId]);
            
            if (commentResult.rows.length === 0) {
                return res.status(404).json({ message: 'Comment not found' });
            }
            
            const comment = commentResult.rows[0];
            
            // Check if user is the author or an admin
            if (comment.user_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to delete this comment' });
            }
            
            await boardModel.deleteComment(commentId);
            
            res.status(200).json({
                message: 'Comment deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            res.status(500).json({ message: 'Error deleting comment' });
        }
    },
    
    // Get user's posts
    getUserPosts: async (req, res) => {
        try {
            const userId = req.user.id;
            
            const posts = await boardModel.getUserPosts(userId);
            
            res.status(200).json({ posts });
        } catch (error) {
            console.error('Error getting user posts:', error);
            res.status(500).json({ message: 'Error getting user posts' });
        }
    }
};

module.exports = boardController;
