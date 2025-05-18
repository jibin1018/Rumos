// backend/controllers/contactController.js
const contactModel = require('../models/contactModel');
const propertyModel = require('../models/propertyModel');
const agentModel = require('../models/agentModel');

// Controller functions for contact routes
const contactController = {
    // Create contact request
    createContactRequest: async (req, res) => {
        try {
            const userId = req.user.id;
            const { propertyId } = req.params;
            const { message } = req.body;
            
            // Check if property exists
            const property = await propertyModel.getPropertyById(propertyId);
            
            if (!property) {
                return res.status(404).json({ message: 'Property not found' });
            }
            
            // Create contact request
            const contactRequest = await contactModel.createContactRequest({
                user_id: userId,
                property_id: propertyId,
                agent_id: property.agent_id,
                message: message || null
            });
            
            res.status(201).json({
                message: 'Contact request sent successfully',
                contactRequest
            });
        } catch (error) {
            console.error('Error creating contact request:', error);
            res.status(500).json({ message: 'Error creating contact request' });
        }
    },
    
    // Get contact requests for an agent
    getAgentContactRequests: async (req, res) => {
        try {
            const userId = req.user.id;
            
            // Get agent ID for this user
            const agent = await agentModel.getAgentByUserId(userId);
            
            if (!agent) {
                return res.status(403).json({ message: 'Only agents can view contact requests' });
            }
            
            const contactRequests = await contactModel.getAgentContactRequests(agent.agent_id);
            
            res.status(200).json({ contactRequests });
        } catch (error) {
            console.error('Error getting agent contact requests:', error);
            res.status(500).json({ message: 'Error getting agent contact requests' });
        }
    },
    
    // Get contact requests for a user
    getUserContactRequests: async (req, res) => {
        try {
            const userId = req.user.id;
            
            const contactRequests = await contactModel.getUserContactRequests(userId);
            
            res.status(200).json({ contactRequests });
        } catch (error) {
            console.error('Error getting user contact requests:', error);
            res.status(500).json({ message: 'Error getting user contact requests' });
        }
    },
    
    // Mark contact request as read
    markAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            const { requestId } = req.params;
            
            // Get agent ID for this user
            const agent = await agentModel.getAgentByUserId(userId);
            
            if (!agent) {
                return res.status(403).json({ message: 'Only agents can mark contact requests as read' });
            }
            
            const updatedRequest = await contactModel.markAsRead(requestId, agent.agent_id);
            
            if (!updatedRequest) {
                return res.status(404).json({ message: 'Contact request not found' });
            }
            
            res.status(200).json({
                message: 'Contact request marked as read',
                contactRequest: updatedRequest
            });
        } catch (error) {
            console.error('Error marking contact request as read:', error);
            res.status(500).json({ message: 'Error marking contact request as read' });
        }
    },
    
    // Delete contact request
    deleteContactRequest: async (req, res) => {
        try {
            const userId = req.user.id;
            const { requestId } = req.params;
            
            const deletedRequest = await contactModel.deleteContactRequest(requestId, userId);
            
            if (!deletedRequest) {
                return res.status(404).json({ message: 'Contact request not found' });
            }
            
            res.status(200).json({
                message: 'Contact request deleted successfully',
                contactRequest: deletedRequest
            });
        } catch (error) {
            console.error('Error deleting contact request:', error);
            res.status(500).json({ message: 'Error deleting contact request' });
        }
    }
};

module.exports = contactController;
