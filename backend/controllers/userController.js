// backend/controllers/userController.js
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwtGenerator');
const { isValidEmail, isValidPhoneNumber, isStrongPassword } = require('../utils/validators');

// Controller functions for user routes
const userController = {
    // Register a new user
    register: async (req, res) => {
        try {
            const { username, password, email, phone_number, role } = req.body;
            
            // Validate input
            if (!username || !password || !email || !phone_number) {
                return res.status(400).json({ message: 'All fields are required' });
            }
            
            // Validate email
            if (!isValidEmail(email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            
            // Validate phone number
            if (!isValidPhoneNumber(phone_number)) {
                return res.status(400).json({ message: 'Invalid phone number format' });
            }
            
            // Validate password strength
            if (!isStrongPassword(password)) {
                return res.status(400).json({ 
                    message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' 
                });
            }
            
            // Check if username already exists
            const existingUsername = await userModel.getUserByUsername(username);
            if (existingUsername) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            
            // Check if email already exists
            const existingEmail = await userModel.getUserByEmail(email);
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            
            // Create user
            const newUser = await userModel.createUser({
                username,
                password,
                email,
                phone_number,
                role: role || 'user' // Default role is 'user'
            });
            
            // Generate JWT token
            const token = generateToken({
                id: newUser.user_id,
                username: newUser.username,
                role: newUser.role
            });
            
            res.status(201).json({
                message: 'User registered successfully',
                user: newUser,
                token
            });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Error registering user' });
        }
    },
    
    // Login user
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            
            // Validate input
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }
            
            // Verify credentials
            const user = await userModel.verifyCredentials(username, password);
            
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            // Generate JWT token
            const token = generateToken({
                id: user.user_id,
                username: user.username,
                role: user.role
            });
            
            res.status(200).json({
                message: 'Login successful',
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    phone_number: user.phone_number,
                    role: user.role
                },
                token
            });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Error logging in' });
        }
    },
    
    // Get user profile
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            
            const user = await userModel.getUserById(userId);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.status(200).json({
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    phone_number: user.phone_number,
                    role: user.role,
                    created_at: user.created_at
                }
            });
        } catch (error) {
            console.error('Error getting user profile:', error);
            res.status(500).json({ message: 'Error getting user profile' });
        }
    },
    
    // Update user profile
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { email, phone_number, password } = req.body;
            
            // Validate email if provided
            if (email && !isValidEmail(email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            
            // Validate phone number if provided
            if (phone_number && !isValidPhoneNumber(phone_number)) {
                return res.status(400).json({ message: 'Invalid phone number format' });
            }
            
            // Validate password strength if provided
            if (password && !isStrongPassword(password)) {
                return res.status(400).json({ 
                    message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' 
                });
            }
            
            // Check if email already exists (but not for this user)
            if (email) {
                const existingEmail = await userModel.getUserByEmail(email);
                if (existingEmail && existingEmail.user_id !== userId) {
                    return res.status(400).json({ message: 'Email already exists' });
                }
            }
            
            // Update user
            const updatedUser = await userModel.updateUser(userId, {
                email,
                phone_number,
                password
            });
            
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.status(200).json({
                message: 'Profile updated successfully',
                user: updatedUser
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            res.status(500).json({ message: 'Error updating user profile' });
        }
    },
    
    // Get all users (admin only)
    getAllUsers: async (req, res) => {
        try {
            const users = await userModel.getAllUsers();
            
            res.status(200).json({ users });
        } catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({ message: 'Error getting all users' });
        }
    },
    
    // Get user by ID (admin only)
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const user = await userModel.getUserById(id);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.status(200).json({ user });
        } catch (error) {
            console.error('Error getting user by ID:', error);
            res.status(500).json({ message: 'Error getting user by ID' });
        }
    },
    
    // Delete user (admin only or own account)
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
    }
};

module.exports = userController;
