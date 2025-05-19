// backend/models/userModel.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

const userModel = {
    // Get all users
    getAllUsers: async () => {
        const query = 'SELECT user_id, username, email, phone_number, role, created_at, updated_at FROM users';
        const result = await db.query(query);
        return result.rows;
    },
    
    // Get user by ID
    getUserById: async (userId) => {
        const query = 'SELECT user_id, username, email, phone_number, role, created_at, updated_at FROM users WHERE user_id = $1';
        const result = await db.query(query, [userId]);
        return result.rows[0];
    },
    
    // Get user by username
    getUserByUsername: async (username) => {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await db.query(query, [username]);
        return result.rows[0];
    },
    
    // Get user by email
    getUserByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows[0];
    },
    
    // Create new user
    createUser: async (userData) => {
        const { username, password, email, phone_number, role } = userData;
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const query = `
            INSERT INTO users (username, password, email, phone_number, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING user_id, username, email, phone_number, role, created_at, updated_at
        `;
        
        const values = [username, hashedPassword, email, phone_number, role || 'user'];
        const result = await db.query(query, values);
        
        return result.rows[0];
    },
    
    // Update user
    updateUser: async (userId, userData) => {
        const { email, phone_number, password } = userData;
        
        let query = 'UPDATE users SET ';
        const values = [];
        const updateFields = [];
        
        // Add fields to update
        if (email) {
            values.push(email);
            updateFields.push(`email = $${values.length}`);
        }
        
        if (phone_number) {
            values.push(phone_number);
            updateFields.push(`phone_number = $${values.length}`);
        }
        
        if (password) {
            // Hash new password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            values.push(hashedPassword);
            updateFields.push(`password = $${values.length}`);
        }
        
        // Add updated_at field
        values.push(new Date());
        updateFields.push(`updated_at = $${values.length}`);
        
        // Add user_id to values array
        values.push(userId);
        
        // Complete query
        query += updateFields.join(', ');
        query += ` WHERE user_id = $${values.length} RETURNING user_id, username, email, phone_number, role, created_at, updated_at`;
        
        const result = await db.query(query, values);
        return result.rows[0];
    },
    
    // Delete user
    deleteUser: async (userId) => {
        const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
        const result = await db.query(query, [userId]);
        return result.rows[0];
    },
    
    // Verify user credentials
    verifyCredentials: async (username, password) => {
        // Get user by username
        const user = await userModel.getUserByUsername(username);
        
        if (!user) {
            return null;
        }
        
        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return null;
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
};

module.exports = userModel;
