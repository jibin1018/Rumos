// backend/models/agentModel.js
const db = require('../config/db');

const agentModel = {
    // Get all agents
    getAllAgents: async () => {
        const query = `
            SELECT a.*, u.username, u.email, u.phone_number, u.role 
            FROM agents a
            JOIN users u ON a.user_id = u.user_id
        `;
        const result = await db.query(query);
        return result.rows;
    },
    
    // Get agent by agent_id
    getAgentById: async (agentId) => {
        const query = `
            SELECT a.*, u.username, u.email, u.phone_number, u.role 
            FROM agents a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.agent_id = $1
        `;
        const result = await db.query(query, [agentId]);
        return result.rows[0];
    },
    
    // Get agent by user_id
    getAgentByUserId: async (userId) => {
        const query = `
            SELECT a.*, u.username, u.email, u.phone_number, u.role 
            FROM agents a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.user_id = $1
        `;
        const result = await db.query(query, [userId]);
        return result.rows[0];
    },
    
    // Create agent profile
    createAgent: async (agentData) => {
        const { user_id, license_image, company_name, office_address } = agentData;
        
        const query = `
            INSERT INTO agents (user_id, license_image, company_name, office_address)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const values = [user_id, license_image, company_name, office_address];
        const result = await db.query(query, values);
        
        // Get the agent with user info
        return await agentModel.getAgentById(result.rows[0].agent_id);
    },
    
    // Update agent profile
    updateAgent: async (agentId, agentData) => {
        const { license_image, company_name, office_address } = agentData;
        
        let query = 'UPDATE agents SET ';
        const values = [];
        const updateFields = [];
        
        // Add fields to update
        if (license_image) {
            values.push(license_image);
            updateFields.push(`license_image = $${values.length}`);
        }
        
        if (company_name !== undefined) {
            values.push(company_name);
            updateFields.push(`company_name = $${values.length}`);
        }
        
        if (office_address !== undefined) {
            values.push(office_address);
            updateFields.push(`office_address = $${values.length}`);
        }
        
        // Add updated_at field
        values.push(new Date());
        updateFields.push(`updated_at = $${values.length}`);
        
        // Add agent_id to values array
        values.push(agentId);
        
        // Complete query
        query += updateFields.join(', ');
        query += ` WHERE agent_id = $${values.length} RETURNING *`;
        
        const result = await db.query(query, values);
        
        // Get the updated agent with user info
        if (result.rows.length > 0) {
            return await agentModel.getAgentById(result.rows[0].agent_id);
        }
        
        return null;
    },
    
    // Update agent verification status
    updateVerificationStatus: async (agentId, status) => {
        const query = `
            UPDATE agents
            SET verification_status = $1, updated_at = NOW()
            WHERE agent_id = $2
            RETURNING *
        `;
        
        const result = await db.query(query, [status, agentId]);
        
        // Get the updated agent with user info
        if (result.rows.length > 0) {
            return await agentModel.getAgentById(result.rows[0].agent_id);
        }
        
        return null;
    },
    
    // Get agents pending verification
    getPendingAgents: async () => {
        const query = `
            SELECT a.*, u.username, u.email, u.phone_number, u.role 
            FROM agents a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.verification_status = 'pending'
        `;
        const result = await db.query(query);
        return result.rows;
    },
    
    // Delete agent
    deleteAgent: async (agentId) => {
        const query = 'DELETE FROM agents WHERE agent_id = $1 RETURNING *';
        const result = await db.query(query, [agentId]);
        return result.rows[0];
    }
};

module.exports = agentModel;
