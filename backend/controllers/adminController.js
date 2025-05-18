// backend/controllers/adminController.js
const userModel = require('../models/userModel');
const agentModel = require('../models/agentModel');
const propertyModel = require('../models/propertyModel');
const db = require('../config/db');

// Controller functions for admin routes
const adminController = {
    // Get dashboard statistics
    getDashboardStats: async (req, res) => {
        try {
            // Get total users count
            const usersQuery = 'SELECT COUNT(*) as total_users FROM users';
            const usersResult = await db.query(usersQuery);
            
            // Get total agents count
            const agentsQuery = 'SELECT COUNT(*) as total_agents FROM agents';
            const agentsResult = await db.query(agentsQuery);
            
            // Get pending agents count
            const pendingAgentsQuery = "SELECT COUNT(*) as pending_agents FROM agents WHERE verification_status = 'pending'";
            const pendingAgentsResult = await db.query(pendingAgentsQuery);
            
            // Get total properties count
            const propertiesQuery = 'SELECT COUNT(*) as total_properties FROM properties';
            const propertiesResult = await db.query(propertiesQuery);
            
            // Get total posts count
            const postsQuery = 'SELECT COUNT(*) as total_posts FROM board_posts';
            const postsResult = await db.query(postsQuery);
            
            // Get recent users
            const recentUsersQuery = `
                SELECT user_id, username, email, role, created_at
                FROM users
                ORDER BY created_at DESC
                LIMIT 5
            `;
            const recentUsersResult = await db.query(recentUsersQuery);
            
            // Get recent properties
            const recentPropertiesQuery = `
                SELECT p.property_id, p.address, p.deposit, p.monthly_rent, p.created_at,
                       a.agent_id, u.username as agent_name
                FROM properties p
                JOIN agents a ON p.agent_id = a.agent_id
                JOIN users u ON a.user_id = u.user_id
                ORDER BY p.created_at DESC
                LIMIT 5
            `;
            const recentPropertiesResult = await db.query(recentPropertiesQuery);
            
            res.status(200).json({
                stats: {
                    total_users: parseInt(usersResult.rows[0].total_users),
                    total_agents: parseInt(agentsResult.rows[0].total_agents),
                    pending_agents: parseInt(pendingAgentsResult.rows[0].pending_agents),
                    total_properties: parseInt(propertiesResult.rows[0].total_properties),
                    total_posts: parseInt(postsResult.rows[0].total_posts)
                },
                recent_users: recentUsersResult.rows,
                recent_properties: recentPropertiesResult.rows
            });
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({ message: 'Error getting dashboard stats' });
        }
    },
    
    // Get pending agent verifications
    getPendingAgents: async (req, res) => {
        try {
            const pendingAgents = await agentModel.getPendingAgents();
            
            res.status(200).json({ agents: pendingAgents });
        } catch (error) {
            console.error('Error getting pending agents:', error);
            res.status(500).json({ message: 'Error getting pending agents' });
        }
    },
    
    // Verify agent
    verifyAgent: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            // Validate status
            if (!['verified', 'rejected'].includes(status)) {
                return res.status(400).json({ message: 'Invalid verification status' });
            }
            
            // Check if agent exists
            const agent = await agentModel.getAgentById(id);
            
            if (!agent) {
                return res.status(404).json({ message: 'Agent not found' });
            }
            
            // Update verification status
            const updatedAgent = await agentModel.updateVerificationStatus(id, status);
            
            res.status(200).json({
                message: `Agent ${status === 'verified' ? 'verified' : 'rejected'} successfully`,
                agent: updatedAgent
            });
        } catch (error) {
            console.error('Error verifying agent:', error);
            res.status(500).json({ message: 'Error verifying agent' });
        }
    },
    
    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await userModel.getAllUsers();
            
            res.status(200).json({ users });
        } catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({ message: 'Error getting all users' });
        }
    },
    
    // Get all agents
    getAllAgents: async (req, res) => {
        try {
            const agents = await agentModel.getAllAgents();
            
            res.status(200).json({ agents });
        } catch (error) {
            console.error('Error getting all agents:', error);
            res.status(500).json({ message: 'Error getting all agents' });
        }
    },
    
    // Delete user
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Check if user exists
            const user = await userModel.getUserById(id);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // Delete user
            await userModel.deleteUser(id);
            
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Error deleting user' });
        }
    },
    
    // Create category
    createCategory: async (req, res) => {
        try {
            const { name, description } = req.body;
            
            // Validate input
            if (!name) {
                return res.status(400).json({ message: 'Category name is required' });
            }
            
            // Create category
            const query = 'INSERT INTO board_categories (name, description) VALUES ($1, $2) RETURNING *';
            const result = await db.query(query, [name, description || null]);
            
            res.status(201).json({
                message: 'Category created successfully',
                category: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({ message: 'Error creating category' });
        }
    },
    
    // Update category
    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            
            // Validate input
            if (!name) {
                return res.status(400).json({ message: 'Category name is required' });
            }
            
            // Update category
            const query = 'UPDATE board_categories SET name = $1, description = $2 WHERE category_id = $3 RETURNING *';
            const result = await db.query(query, [name, description || null, id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }
            
            res.status(200).json({
                message: 'Category updated successfully',
                category: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).json({ message: 'Error updating category' });
        }
    },
    
    // Delete category
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Update posts with this category to have no category
            await db.query('UPDATE board_posts SET category_id = NULL WHERE category_id = $1', [id]);
            
            // Delete category
            const query = 'DELETE FROM board_categories WHERE category_id = $1 RETURNING *';
            const result = await db.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }
            
            res.status(200).json({
                message: 'Category deleted successfully',
                category: result.rows[0]
            });
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ message: 'Error deleting category' });
        }
    }
};

module.exports = adminController;
