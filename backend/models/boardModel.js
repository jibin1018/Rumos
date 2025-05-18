// backend/models/boardModel.js
const db = require('../config/db');

const boardModel = {
    // Get all categories
    getCategories: async () => {
        const query = 'SELECT * FROM board_categories ORDER BY name';
        const result = await db.query(query);
        return result.rows;
    },
    
    // Get all posts with pagination
    getAllPosts: async (limit = 10, offset = 0, categoryId = null) => {
        let query = `
            SELECT bp.*, 
                   u.username, 
                   bc.name as category_name,
                   (SELECT COUNT(*) FROM board_comments WHERE post_id = bp.post_id) as comment_count
            FROM board_posts bp
            JOIN users u ON bp.user_id = u.user_id
            LEFT JOIN board_categories bc ON bp.category_id = bc.category_id
        `;
        
        const values = [];
        
        // Filter by category if provided
        if (categoryId) {
            values.push(categoryId);
            query += ` WHERE bp.category_id = $${values.length}`;
        }
        
        // Add order, limit and offset
        query += ` ORDER BY bp.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limit, offset);
        
        const result = await db.query(query, values);
        return result.rows;
    },
    
    // Get total post count
    getPostCount: async (categoryId = null) => {
        let query = 'SELECT COUNT(*) as total FROM board_posts';
        
        const values = [];
        
        // Filter by category if provided
        if (categoryId) {
            values.push(categoryId);
            query += ` WHERE category_id = $1`;
        }
        
        const result = await db.query(query, values);
        return parseInt(result.rows[0].total);
    },
    
    // Get post by ID with comments
    getPostById: async (postId) => {
        // Get post details
        const postQuery = `
            SELECT bp.*, 
                   u.username,
                   bc.name as category_name
            FROM board_posts bp
            JOIN users u ON bp.user_id = u.user_id
            LEFT JOIN board_categories bc ON bp.category_id = bc.category_id
            WHERE bp.post_id = $1
        `;
        
        const postResult = await db.query(postQuery, [postId]);
        
        if (postResult.rows.length === 0) {
            return null;
        }
        
        // Increment view count
        await db.query('UPDATE board_posts SET views = views + 1 WHERE post_id = $1', [postId]);
        
        // Get comments
        const commentsQuery = `
            SELECT bc.*, u.username
            FROM board_comments bc
            JOIN users u ON bc.user_id = u.user_id
            WHERE bc.post_id = $1
            ORDER BY bc.created_at ASC
        `;
        
        const commentsResult = await db.query(commentsQuery, [postId]);
        
        // Return post with comments
        return {
            ...postResult.rows[0],
            comments: commentsResult.rows
        };
    },
    
    // Create post
    createPost: async (postData) => {
        const { user_id, category_id, title, content } = postData;
        
        const query = `
            INSERT INTO board_posts (user_id, category_id, title, content)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await db.query(query, [user_id, category_id, title, content]);
        
        // Get the created post with username and category
        return await boardModel.getPostById(result.rows[0].post_id);
    },
    
    // Update post
    updatePost: async (postId, postData) => {
        const { category_id, title, content } = postData;
        
        const query = `
            UPDATE board_posts
            SET category_id = $1, title = $2, content = $3, updated_at = NOW()
            WHERE post_id = $4
            RETURNING *
        `;
        
        const result = await db.query(query, [category_id, title, content, postId]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        // Get the updated post with username and category
        return await boardModel.getPostById(result.rows[0].post_id);
    },
    
    // Delete post
    deletePost: async (postId) => {
        // Start a transaction
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Delete comments first
            await client.query('DELETE FROM board_comments WHERE post_id = $1', [postId]);
            
            // Delete the post
            const query = 'DELETE FROM board_posts WHERE post_id = $1 RETURNING *';
            const result = await client.query(query, [postId]);
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
    
    // Add comment
    addComment: async (commentData) => {
        const { post_id, user_id, content } = commentData;
        
        const query = `
            INSERT INTO board_comments (post_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        
        const result = await db.query(query, [post_id, user_id, content]);
        
        // Get username for the comment
        const userQuery = 'SELECT username FROM users WHERE user_id = $1';
        const userResult = await db.query(userQuery, [user_id]);
        
        // Return comment with username
        return {
            ...result.rows[0],
            username: userResult.rows[0].username
        };
    },
    
    // Update comment
    updateComment: async (commentId, content) => {
        const query = `
            UPDATE board_comments
            SET content = $1, updated_at = NOW()
            WHERE comment_id = $2
            RETURNING *
        `;
        
        const result = await db.query(query, [content, commentId]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        // Get username for the comment
        const userQuery = 'SELECT username FROM users WHERE user_id = $1';
        const userResult = await db.query(userQuery, [result.rows[0].user_id]);
        
        // Return comment with username
        return {
            ...result.rows[0],
            username: userResult.rows[0].username
        };
    },
    
    // Delete comment
    deleteComment: async (commentId) => {
        const query = 'DELETE FROM board_comments WHERE comment_id = $1 RETURNING *';
        const result = await db.query(query, [commentId]);
        return result.rows[0];
    },
    
    // Get user's posts
    getUserPosts: async (userId) => {
        const query = `
            SELECT bp.*, 
                   bc.name as category_name,
                   (SELECT COUNT(*) FROM board_comments WHERE post_id = bp.post_id) as comment_count
            FROM board_posts bp
            LEFT JOIN board_categories bc ON bp.category_id = bc.category_id
            WHERE bp.user_id = $1
            ORDER BY bp.created_at DESC
        `;
        
        const result = await db.query(query, [userId]);
        return result.rows;
    }
};

module.exports = boardModel;
