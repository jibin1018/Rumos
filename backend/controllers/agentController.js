// backend/controllers/agentController.js
const agentModel = require('../models/agentModel');
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwtGenerator');
const fs = require('fs');
const path = require('path');

// Controller functions for agent routes
const agentController = {
    // Register a new agent
    registerAgent: async (req, res) => {
        try {
            const { username, password, email, phone_number, company_name, office_address } = req.body;
            
            // Validate input
            if (!username || !password || !email || !phone_number) {
                return res.status(400).json({ message: 'All required fields must be provided' });
            }
            
            // Validate license image
            if (!req.file) {
                return res.status(400).json({ message: 'License image is required' });
            }
            
            // Create user with agent role
            const newUser = await userModel.createUser({
                username,
                password,
                email,
                phone_number,
                role: 'agent'
            });
            
            // Create agent profile
            const licenseImagePath = `/uploads/licenses/${path.basename(req.file.path)}`;
            
            const newAgent = await agentModel.createAgent({
                user_id: newUser.user_id,
                license_image: licenseImagePath,
                company_name: company_name || null,
                office_address: office_address || null
            });
            
            // Generate JWT token
            const token = generateToken({
                id: newUser.user_id,
                username: newUser.username,
                role: newUser.role
            });
            
            res.status(201).json({
                message: 'Agent registered successfully. Awaiting admin verification.',
                agent: newAgent,
                token
            });
        } catch (error) {
            console.error('Error registering agent:', error);
            // If error occurs, delete uploaded file if it exists
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
            res.status(500).json({ message: 'Error registering agent' });
        }
    },
    
    // Get agent profile
    getAgentProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            
            // Check if user is an agent
            const agent = await agentModel.getAgentByUserId(userId);
            
            if (!agent) {
                return res.status(404).json({ message: 'Agent profile not found' });
            }
            
            res.status(200).json({ agent });
        } catch (error) {
            console.error('Error getting agent profile:', error);
            res.status(500).json({ message: 'Error getting agent profile' });
        }
    },
    
    // Update agent profile
    updateAgentProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { company_name, office_address } = req.body;
            
            // Check if user is an agent
            const agent = await agentModel.getAgentByUserId(userId);
            
            if (!agent) {
                return res.status(404).json({ message: 'Agent profile not found' });
            }
            
            // Prepare update data
            const updateData = {
                company_name,
                office_address
            };
            
            // Add license image if provided
            if (req.file) {
                updateData.license_image = `/uploads/licenses/${path.basename(req.file.path)}`;
            }
            
            // Update agent
            const updatedAgent = await agentModel.updateAgent(agent.agent_id, updateData);
            
            // If license image was updated, delete old one
            if (req.file && agent.license_image) {
                const oldFilePath = path.join(__dirname, '..', agent.license_image);
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.error('Error deleting old license image:', err);
                });
            }
            
            res.status(200).json({
                message: 'Agent profile updated successfully',
                agent: updatedAgent
            });
        } catch (error) {
            console.error('Error updating agent profile:', error);
            // If error occurs, delete uploaded file if it exists
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
            res.status(500).json({ message: 'Error updating agent profile' });
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
    
    // Get agent by ID
    getAgentById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const agent = await agentModel.getAgentById(id);
            
            if (!agent) {
                return res.status(404).json({ message: 'Agent not found' });
            }
            
            res.status(200).json({ agent });
        } catch (error) {
            console.error('Error getting agent by ID:', error);
            res.status(500).json({ message: 'Error getting agent by ID' });
        }
    },
    
    // Get pending verification agents (admin only)
    getPendingAgents: async (req, res) => {
        try {
            const pendingAgents = await agentModel.getPendingAgents();
            
            res.status(200).json({ agents: pendingAgents });
        } catch (error) {
            console.error('Error getting pending agents:', error);
            res.status(500).json({ message: 'Error getting pending agents' });
        }
    },
    
    // Verify agent (admin only)
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
    }
};

module.exports = agentController;
