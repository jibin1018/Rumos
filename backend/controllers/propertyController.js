// backend/controllers/propertyController.js
const propertyModel = require('../models/propertyModel');
const agentModel = require('../models/agentModel');
const { validatePropertyData } = require('../utils/validators');
const fs = require('fs');
const path = require('path');

// Helper function to delete a file
const deleteFile = (filePath) => {
    const fullPath = path.join(__dirname, '..', filePath);
    fs.unlink(fullPath, (err) => {
        if (err) console.error('Error deleting file:', err);
    });
};

// Controller functions for property routes
const propertyController = {
    // Get all properties with filtering
    getAllProperties: async (req, res) => {
        try {
            // Extract filter parameters from query
            const {
                city, min_deposit, max_deposit, min_monthly_rent, max_monthly_rent,
                property_type, room_count, page = 1, limit = 10
            } = req.query;
            
            // Calculate offset for pagination
            const offset = (page - 1) * limit;
            
            // Prepare filters
            const filters = {
                city,
                min_deposit: min_deposit ? parseInt(min_deposit) : undefined,
                max_deposit: max_deposit ? parseInt(max_deposit) : undefined,
                min_monthly_rent: min_monthly_rent ? parseInt(min_monthly_rent) : undefined,
                max_monthly_rent: max_monthly_rent ? parseInt(max_monthly_rent) : undefined,
                property_type,
                room_count: room_count ? parseInt(room_count) : undefined,
                limit: parseInt(limit),
                offset
            };
            
            // Get properties with filters
            const properties = await propertyModel.getAllProperties(filters);
            
            // Get total count for pagination
            const total = await propertyModel.getPropertyCount(filters);
            
            res.status(200).json({
                properties,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting properties:', error);
            res.status(500).json({ message: 'Error getting properties' });
        }
    },
    
    // Get recent properties for homepage
    getRecentProperties: async (req, res) => {
        try {
            const limit = req.query.limit || 3;
            const properties = await propertyModel.getRecentProperties(limit);
            
            res.status(200).json({ properties });
        } catch (error) {
            console.error('Error getting recent properties:', error);
            res.status(500).json({ message: 'Error getting recent properties' });
        }
    },
    
    // Get property by ID
    getPropertyById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const property = await propertyModel.getPropertyById(id);
            
            if (!property) {
                return res.status(404).json({ message: 'Property not found' });
            }
            
            res.status(200).json({ property });
        } catch (error) {
            console.error('Error getting property by ID:', error);
            res.status(500).json({ message: 'Error getting property by ID' });
        }
    },
    
    // Get properties by agent ID
    getPropertiesByAgentId: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Check if agent exists
            const agent = await agentModel.getAgentById(id);
            
            if (!agent) {
                return res.status(404).json({ message: 'Agent not found' });
            }
            
            const properties = await propertyModel.getPropertiesByAgentId(id);
            
            res.status(200).json({ properties });
        } catch (error) {
            console.error('Error getting properties by agent ID:', error);
            res.status(500).json({ message: 'Error getting properties by agent ID' });
        }
    },
    
    // Create property
    createProperty: async (req, res) => {
        try {
            const userId = req.user.id;
            
            // Get agent ID for this user
            const agent = await agentModel.getAgentByUserId(userId);
            
            if (!agent) {
                return res.status(403).json({ message: 'Only verified agents can create properties' });
            }
            
            if (agent.verification_status !== 'verified') {
                return res.status(403).json({ message: 'Your agent account is not verified yet' });
            }
            
            // Extract property data from request body
            const propertyData = {
                ...req.body,
                agent_id: agent.agent_id
            };
            
            // Validate property data
            const validationErrors = validatePropertyData(propertyData);
            
            if (validationErrors.length > 0) {
                return res.status(400).json({ 
                    message: 'Validation failed', 
                    errors: validationErrors 
                });
            }
            
            // Create property
            const newProperty = await propertyModel.createProperty(propertyData);
            
            // Handle image uploads if any
            if (req.files && req.files.length > 0) {
                // Process uploaded files
                const imagePaths = req.files.map(file => `/uploads/properties/${path.basename(file.path)}`);
                
                // Add images to property
                const thumbnailIndex = req.body.thumbnailIndex ? parseInt(req.body.thumbnailIndex) : 0;
                await propertyModel.addPropertyImages(newProperty.property_id, imagePaths, thumbnailIndex);
            }
            
            // Get complete property with images
            const completeProperty = await propertyModel.getPropertyById(newProperty.property_id);
            
            res.status(201).json({
                message: 'Property created successfully',
                property: completeProperty
            });
        } catch (error) {
            console.error('Error creating property:', error);
            // If error occurs, delete uploaded files if they exist
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            res.status(500).json({ message: 'Error creating property' });
        }
    },
    
    // Update property
    updateProperty: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            // Get agent ID for this user
            const agent = await agentModel.getAgentByUserId(userId);
            
            if (!agent) {
                return res.status(403).json({ message: 'Only agents can update properties' });
            }
            
            // Get property to check ownership
            const property = await propertyModel.getPropertyById(id);
            
            if (!property) {
                return res.status(404).json({ message: 'Property not found' });
            }
            
            // Check if the agent owns this property or is an admin
            if (property.agent_id !== agent.agent_id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'You can only update your own properties' });
            }
            
            // Extract property data from request body
            const propertyData = req.body;
            
            // Validate property data
            const validationErrors = validatePropertyData(propertyData);
            
            if (validationErrors.length > 0) {
                return res.status(400).json({ 
                    message: 'Validation failed', 
                    errors: validationErrors 
                });
            }
            
            // Update property
            const updatedProperty = await propertyModel.updateProperty(id, propertyData);
            
            // Handle image uploads if any
            if (req.files && req.files.length > 0) {
                // Process uploaded files
                const imagePaths = req.files.map(file => `/uploads/properties/${path.basename(file.path)}`);
                
                // Add images to property
                const thumbnailIndex = req.body.thumbnailIndex ? parseInt(req.body.thumbnailIndex) : 0;
                await propertyModel.addPropertyImages(id, imagePaths, thumbnailIndex);
            }
            
            // Get complete property with images
            const completeProperty = await propertyModel.getPropertyById(id);
            
            res.status(200).json({
                message: 'Property updated successfully',
                property: completeProperty
            });
        } catch (error) {
            console.error('Error updating property:', error);
            // If error occurs, delete uploaded files if they exist
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            res.status(500).json({ message: 'Error updating property' });
        }
    },
    
    // Update property thumbnail
    updatePropertyThumbnail: async (req, res) => {
        try {
            const { id } = req.params;
            const { imageId } = req.body;
            const userId = req.user.id;
            
            // Get agent ID for this user
            const agent = await agentModel.getAgentByUserId(userId);
            
            if (!agent) {
                return res.status(403).json({ message: 'Only agents can update properties' });
            }
            
            // Get property to check ownership
            const property = await propertyModel.getPropertyById(id);
            
            if (!property) {
                return res.status(404).json({ message: 'Property not found' });
            }
            
            // Check if the agent owns this property or is an admin
            if (property.agent_id !== agent.agent_id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'You can only update your own properties' });
            }
            
            // Update thumbnail
            const updatedImages = await propertyModel.updatePropertyThumbnail(id, imageId);
            
            res.status(200).json({
                message: 'Property thumbnail updated successfully',
                images: updatedImages
            });
        } catch (error) {
            console.error('Error updating property thumbnail:', error);
            res.status(500).json({ message: 'Error updating property thumbnail' });
        }
    },
    
    // Delete property image
    deletePropertyImage: async (req, res) => {
        try {
            const { id, imageId } = req.params;
            const userId = req.user.id;
            
            // Get agent ID for this user
            const agent = await agentModel.getAgentByUserId(userId);
            
            if (!agent) {
                return res.status(403).json({ message: 'Only agents can update properties' });
            }
            
            // Get property to check ownership
            const property = await propertyModel.getPropertyById(id);
            
            if (!property) {
                return res.status(404).json({ message: 'Property not found' });
            }
            
            // Check if the agent owns this property or is an admin
            if (property.agent_id !== agent.agent_id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'You can only update your own properties' });
            }
            
            // Find image to get path for deletion
            const imageToDelete = property.images.find(img => img.image_id == imageId);
            
            if (!imageToDelete) {
                return res.status(404).json({ message: 'Image not found' });
            }
            
            // Delete image from database
            const deletedImage = await propertyModel.deletePropertyImage(imageId, id);
            
            if (!deletedImage) {
                return res.status(404).json({ message: 'Image not found' });
            }
            
            // Delete image file
            deleteFile(imageToDelete.image_path);
            
            // Get updated property with images
            const updatedProperty = await propertyModel.getPropertyById(id);
            
            res.status(200).json({
                message: 'Property image deleted successfully',
                property: updatedProperty
            });
        } catch (error) {
            console.error('Error deleting property image:', error);
            res.status(500).json({ message: 'Error deleting property image' });
        }
    },
    
    // Delete property
    deleteProperty: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            // Get agent ID for this user
            const agent = await agentModel.getAgentByUserId(userId);
            
            if (!agent && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Only agents or admins can delete properties' });
            }
            
            // Get property to check ownership and get images
            const property = await propertyModel.getPropertyById(id);
            
            if (!property) {
                return res.status(404).json({ message: 'Property not found' });
            }
            
            // Check if the agent owns this property or is an admin
            if (agent && property.agent_id !== agent.agent_id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'You can only delete your own properties' });
            }
            
            // Store image paths for deletion
            const imagePaths = property.images.map(img => img.image_path);
            
            // Delete property from database (this will also delete images from DB)
            const deletedProperty = await propertyModel.deleteProperty(id);
            
            if (!deletedProperty) {
                return res.status(404).json({ message: 'Property not found' });
            }
            
            // Delete image files
            imagePaths.forEach(imagePath => deleteFile(imagePath));
            
            res.status(200).json({
                message: 'Property deleted successfully',
                property: deletedProperty
            });
        } catch (error) {
            console.error('Error deleting property:', error);
            res.status(500).json({ message: 'Error deleting property' });
        }
    }
};

module.exports = propertyController;
