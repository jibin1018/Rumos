// backend/models/propertyModel.js
const db = require('../config/db');

const propertyModel = {
    // Get all properties (with filter options)
    getAllProperties: async (filters = {}) => {
        let query = `
            SELECT p.*, 
                   (SELECT image_path FROM property_images pi WHERE pi.property_id = p.property_id AND pi.is_thumbnail = true LIMIT 1) as thumbnail,
                   a.agent_id, a.verification_status, u.username as agent_name, u.phone_number as agent_phone
            FROM properties p
            JOIN agents a ON p.agent_id = a.agent_id
            JOIN users u ON a.user_id = u.user_id
            WHERE p.is_active = true AND a.verification_status = 'verified'
        `;
        
        const values = [];
        
        // Apply filters
        if (filters.city) {
            values.push(filters.city);
            query += ` AND p.city = $${values.length}`;
        }
        
        if (filters.min_deposit !== undefined) {
            values.push(filters.min_deposit);
            query += ` AND p.deposit >= $${values.length}`;
        }
        
        if (filters.max_deposit !== undefined) {
            values.push(filters.max_deposit);
            query += ` AND p.deposit <= $${values.length}`;
        }
        
        if (filters.min_monthly_rent !== undefined) {
            values.push(filters.min_monthly_rent);
            query += ` AND p.monthly_rent >= $${values.length}`;
        }
        
        if (filters.max_monthly_rent !== undefined) {
            values.push(filters.max_monthly_rent);
            query += ` AND p.monthly_rent <= $${values.length}`;
        }
        
        if (filters.property_type) {
            values.push(filters.property_type);
            query += ` AND p.property_type = $${values.length}`;
        }
        
        if (filters.room_count) {
            values.push(filters.room_count);
            query += ` AND p.room_count >= $${values.length}`;
        }
        
        // Order by
        query += ` ORDER BY p.created_at DESC`;
        
        // Pagination
        if (filters.limit) {
            values.push(filters.limit);
            query += ` LIMIT $${values.length}`;
            
            if (filters.offset) {
                values.push(filters.offset);
                query += ` OFFSET $${values.length}`;
            }
        }
        
        const result = await db.query(query, values);
        return result.rows;
    },
    
    // Get recent properties
    getRecentProperties: async (limit = 3) => {
        const query = `
            SELECT p.*, 
                   (SELECT image_path FROM property_images pi WHERE pi.property_id = p.property_id AND pi.is_thumbnail = true LIMIT 1) as thumbnail,
                   a.agent_id, u.username as agent_name, u.phone_number as agent_phone
            FROM properties p
            JOIN agents a ON p.agent_id = a.agent_id
            JOIN users u ON a.user_id = u.user_id
            WHERE p.is_active = true AND a.verification_status = 'verified'
            ORDER BY p.created_at DESC
            LIMIT $1
        `;
        
        const result = await db.query(query, [limit]);
        return result.rows;
    },
    
    // Get property by ID
    getPropertyById: async (propertyId) => {
        const query = `
            SELECT p.*, 
                   a.agent_id, a.company_name, a.office_address, 
                   u.username as agent_name, u.phone_number as agent_phone, u.email as agent_email
            FROM properties p
            JOIN agents a ON p.agent_id = a.agent_id
            JOIN users u ON a.user_id = u.user_id
            WHERE p.property_id = $1 AND p.is_active = true
        `;
        
        const result = await db.query(query, [propertyId]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        // Get property images
        const imagesQuery = `
            SELECT image_id, image_path, is_thumbnail
            FROM property_images
            WHERE property_id = $1
            ORDER BY is_thumbnail DESC, image_id ASC
        `;
        
        const imagesResult = await db.query(imagesQuery, [propertyId]);
        
        // Return property with images
        return {
            ...result.rows[0],
            images: imagesResult.rows
        };
    },
    
    // Get properties by agent ID
    getPropertiesByAgentId: async (agentId) => {
        const query = `
            SELECT p.*, 
                   (SELECT image_path FROM property_images pi WHERE pi.property_id = p.property_id AND pi.is_thumbnail = true LIMIT 1) as thumbnail
            FROM properties p
            WHERE p.agent_id = $1
            ORDER BY p.created_at DESC
        `;
        
        const result = await db.query(query, [agentId]);
        return result.rows;
    },
    
    // Create property
    createProperty: async (propertyData) => {
        const {
            agent_id, address, deposit, monthly_rent, maintenance_fee,
            construction_date, available_from, room_size, room_count,
            bathroom_count, floor, total_floors, heating_type, property_type,
            min_stay_months, has_bed, has_washing_machine, has_refrigerator,
            has_microwave, has_desk, has_closet, has_air_conditioner, city, district
        } = propertyData;
        
        const query = `
            INSERT INTO properties (
                agent_id, address, deposit, monthly_rent, maintenance_fee,
                construction_date, available_from, room_size, room_count,
                bathroom_count, floor, total_floors, heating_type, property_type,
                min_stay_months, has_bed, has_washing_machine, has_refrigerator,
                has_microwave, has_desk, has_closet, has_air_conditioner, city, district
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
            )
            RETURNING *
        `;
        
        const values = [
            agent_id, address, deposit, monthly_rent, maintenance_fee || 0,
            construction_date || null, available_from || null, room_size || null, room_count || 1,
            bathroom_count || 1, floor || null, total_floors || null, heating_type || null, property_type || null,
            min_stay_months || 6, has_bed || false, has_washing_machine || false, has_refrigerator || false,
            has_microwave || false, has_desk || false, has_closet || false, has_air_conditioner || false, city, district || null
        ];
        
        const result = await db.query(query, values);
        return result.rows[0];
    },
    
    // Add property images
    addPropertyImages: async (propertyId, imagePaths, thumbnailIndex = 0) => {
        // Start a transaction
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Add each image to the database
            for (let i = 0; i < imagePaths.length; i++) {
                const isThumbnail = (i === thumbnailIndex);
                
                const query = `
                    INSERT INTO property_images (property_id, image_path, is_thumbnail)
                    VALUES ($1, $2, $3)
                    RETURNING *
                `;
                
                await client.query(query, [propertyId, imagePaths[i], isThumbnail]);
            }
            
            await client.query('COMMIT');
            
            // Get all images for the property
            const imagesQuery = `
                SELECT image_id, image_path, is_thumbnail
                FROM property_images
                WHERE property_id = $1
                ORDER BY is_thumbnail DESC, image_id ASC
            `;
            
            const imagesResult = await client.query(imagesQuery, [propertyId]);
            return imagesResult.rows;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
    
    // Update property
    updateProperty: async (propertyId, propertyData) => {
        // Create dynamic query based on provided fields
        let query = 'UPDATE properties SET ';
        const values = [];
        const updateFields = [];
        
        // Add each field to the query if it exists
        const fields = [
            'address', 'deposit', 'monthly_rent', 'maintenance_fee',
            'construction_date', 'available_from', 'room_size', 'room_count',
            'bathroom_count', 'floor', 'total_floors', 'heating_type', 'property_type',
            'min_stay_months', 'has_bed', 'has_washing_machine', 'has_refrigerator',
            'has_microwave', 'has_desk', 'has_closet', 'has_air_conditioner', 'city', 'district',
            'is_active'
        ];
        
        fields.forEach(field => {
            if (propertyData[field] !== undefined) {
                values.push(propertyData[field]);
                updateFields.push(`${field} = $${values.length}`);
            }
        });
        
        // Add updated_at field
        values.push(new Date());
        updateFields.push(`updated_at = $${values.length}`);
        
        // Add property_id to values array
        values.push(propertyId);
        
        // Complete query
        query += updateFields.join(', ');
        query += ` WHERE property_id = $${values.length} RETURNING *`;
        
        const result = await db.query(query, values);
        return result.rows[0];
    },
    
    // Update property thumbnail
    updatePropertyThumbnail: async (propertyId, imageId) => {
        // Start a transaction
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // First, set all images for this property to not be thumbnails
            await client.query(
                'UPDATE property_images SET is_thumbnail = false WHERE property_id = $1',
                [propertyId]
            );
            
            // Then, set the specified image as the thumbnail
            await client.query(
                'UPDATE property_images SET is_thumbnail = true WHERE image_id = $1 AND property_id = $2',
                [imageId, propertyId]
            );
            
            await client.query('COMMIT');
            
            // Get all images for the property
            const imagesQuery = `
                SELECT image_id, image_path, is_thumbnail
                FROM property_images
                WHERE property_id = $1
                ORDER BY is_thumbnail DESC, image_id ASC
            `;
            
            const imagesResult = await client.query(imagesQuery, [propertyId]);
            return imagesResult.rows;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
    
    // Delete property image
    deletePropertyImage: async (imageId, propertyId) => {
        // Check if the image is a thumbnail
        const checkQuery = 'SELECT is_thumbnail FROM property_images WHERE image_id = $1';
        const checkResult = await db.query(checkQuery, [imageId]);
        
        if (checkResult.rows.length === 0) {
            return null;
        }
        
        const isThumbnail = checkResult.rows[0].is_thumbnail;
        
        // Delete the image
        const deleteQuery = 'DELETE FROM property_images WHERE image_id = $1 RETURNING *';
        const deleteResult = await db.query(deleteQuery, [imageId]);
        
        // If the deleted image was a thumbnail, set another image as thumbnail if available
        if (isThumbnail) {
            const setThumbnailQuery = `
                UPDATE property_images
                SET is_thumbnail = true
                WHERE property_id = $1 AND image_id = (
                    SELECT image_id FROM property_images WHERE property_id = $1 LIMIT 1
                )
                RETURNING *
            `;
            
            await db.query(setThumbnailQuery, [propertyId]);
        }
        
        return deleteResult.rows[0];
    },
    
    // Delete property
    deleteProperty: async (propertyId) => {
        // Start a transaction
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Delete all images for this property
            await client.query('DELETE FROM property_images WHERE property_id = $1', [propertyId]);
            
            // Delete the property
            const deletePropertyQuery = 'DELETE FROM properties WHERE property_id = $1 RETURNING *';
            const result = await client.query(deletePropertyQuery, [propertyId]);
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
    
    // Get total count of properties matching filters
    getPropertyCount: async (filters = {}) => {
        let query = `
            SELECT COUNT(*) as total
            FROM properties p
            JOIN agents a ON p.agent_id = a.agent_id
            WHERE p.is_active = true AND a.verification_status = 'verified'
        `;
        
        const values = [];
        
        // Apply filters
        if (filters.city) {
            values.push(filters.city);
            query += ` AND p.city = $${values.length}`;
        }
        
        if (filters.min_deposit !== undefined) {
            values.push(filters.min_deposit);
            query += ` AND p.deposit >= $${values.length}`;
        }
        
        if (filters.max_deposit !== undefined) {
            values.push(filters.max_deposit);
            query += ` AND p.deposit <= $${values.length}`;
        }
        
        if (filters.min_monthly_rent !== undefined) {
            values.push(filters.min_monthly_rent);
            query += ` AND p.monthly_rent >= $${values.length}`;
        }
        
        if (filters.max_monthly_rent !== undefined) {
            values.push(filters.max_monthly_rent);
            query += ` AND p.monthly_rent <= $${values.length}`;
        }
        
        if (filters.property_type) {
            values.push(filters.property_type);
            query += ` AND p.property_type = $${values.length}`;
        }
        
        if (filters.room_count) {
            values.push(filters.room_count);
            query += ` AND p.room_count >= $${values.length}`;
        }
        
        const result = await db.query(query, values);
        return parseInt(result.rows[0].total);
    }
};

module.exports = propertyModel;
