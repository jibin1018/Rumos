// backend/models/contactModel.js
const db = require('../config/db');

const contactModel = {
    // Create contact request
    createContactRequest: async (data) => {
        const { user_id, property_id, agent_id, message } = data;
        
        const query = `
            INSERT INTO contact_requests (user_id, property_id, agent_id, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await db.query(query, [user_id, property_id, agent_id, message]);
        return result.rows[0];
    },
    
    // Get contact requests for an agent
    getAgentContactRequests: async (agentId) => {
        const query = `
            SELECT cr.*, 
                   u.username as user_name, u.email as user_email, u.phone_number as user_phone,
                   p.address, p.deposit, p.monthly_rent,
                   (SELECT image_path FROM property_images pi WHERE pi.property_id = p.property_id AND pi.is_thumbnail = true LIMIT 1) as property_image
            FROM contact_requests cr
            JOIN users u ON cr.user_id = u.user_id
            JOIN properties p ON cr.property_id = p.property_id
            WHERE cr.agent_id = $1
            ORDER BY cr.created_at DESC
        `;
        
        const result = await db.query(query, [agentId]);
        return result.rows;
    },
    
    // Get contact requests for a user
    getUserContactRequests: async (userId) => {
        const query = `
            SELECT cr.*, 
                   p.address, p.deposit, p.monthly_rent,
                   (SELECT image_path FROM property_images pi WHERE pi.property_id = p.property_id AND pi.is_thumbnail = true LIMIT 1) as property_image,
                   a.agent_id, u.username as agent_name, u.email as agent_email, u.phone_number as agent_phone
            FROM contact_requests cr
            JOIN properties p ON cr.property_id = p.property_id
            JOIN agents a ON cr.agent_id = a.agent_id
            JOIN users u ON a.user_id = u.user_id
            WHERE cr.user_id = $1
            ORDER BY cr.created_at DESC
        `;
        
        const result = await db.query(query, [userId]);
        return result.rows;
    },
    
    // Mark contact request as read
    markAsRead: async (requestId, agentId) => {
        const query = `
            UPDATE contact_requests
            SET is_read = true, updated_at = NOW()
            WHERE request_id = $1 AND agent_id = $2
            RETURNING *
        `;
        
        const result = await db.query(query, [requestId, agentId]);
        return result.rows[0];
    },
    
    // Delete contact request
    deleteContactRequest: async (requestId, userId) => {
        const query = `
            DELETE FROM contact_requests
            WHERE request_id = $1 AND user_id = $2
            RETURNING *
        `;
        
        const result = await db.query(query, [requestId, userId]);
        return result.rows[0];
    }
};

module.exports = contactModel;
