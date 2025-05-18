// backend/models/favoriteModel.js
const db = require('../config/db');

const favoriteModel = {
    // Get all favorites for a user
    getUserFavorites: async (userId) => {
        const query = `
            SELECT f.favorite_id, f.created_at, 
                   p.property_id, p.address, p.deposit, p.monthly_rent, p.city, p.district,
                   (SELECT image_path FROM property_images pi WHERE pi.property_id = p.property_id AND pi.is_thumbnail = true LIMIT 1) as thumbnail
            FROM favorites f
            JOIN properties p ON f.property_id = p.property_id
            JOIN agents a ON p.agent_id = a.agent_id
            WHERE f.user_id = $1 AND p.is_active = true
            ORDER BY f.created_at DESC
        `;
        
        const result = await db.query(query, [userId]);
        return result.rows;
    },
    
    // Check if a property is in user's favorites
    isFavorite: async (userId, propertyId) => {
        const query = 'SELECT * FROM favorites WHERE user_id = $1 AND property_id = $2';
        const result = await db.query(query, [userId, propertyId]);
        return result.rows.length > 0;
    },
    
    // Add property to favorites
    addFavorite: async (userId, propertyId) => {
        // Check if already favorited
        const isFavorite = await favoriteModel.isFavorite(userId, propertyId);
        
        if (isFavorite) {
            return { already_exists: true };
        }
        
        // Insert favorite
        const query = `
            INSERT INTO favorites (user_id, property_id)
            VALUES ($1, $2)
            RETURNING *
        `;
        
        const result = await db.query(query, [userId, propertyId]);
        return result.rows[0];
    },
    
    // Remove property from favorites
    removeFavorite: async (userId, propertyId) => {
        const query = 'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2 RETURNING *';
        const result = await db.query(query, [userId, propertyId]);
        return result.rows[0];
    }
};

module.exports = favoriteModel;
