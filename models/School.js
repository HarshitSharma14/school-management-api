import { pool } from '../config/database.js';

class School {
    /**
     * Create a new school in TiDB Cloud database
     * This function handles adding a school to our MySQL database
     */
    static async createNewSchool(schoolData) {
        const { name, address, latitude, longitude } = schoolData;

        try {
            // SQL query to insert a new school
            // We use ? placeholders to prevent SQL injection attacks
            const insertQuery = `
                INSERT INTO schools (name, address, latitude, longitude) 
                VALUES (?, ?, ?, ?)
            `;

            // Execute the query with our data
            const [result] = await pool.execute(insertQuery, [name, address, latitude, longitude]);

            console.log(`✅ New school added to TiDB Cloud: ${name}`);

            // Return the newly created school data
            return {
                id: result.insertId, // MySQL auto-generated ID
                name: name,
                address: address,
                latitude: latitude,
                longitude: longitude,
                created_at: new Date(),
                message: 'School successfully added!'
            };

        } catch (error) {
            console.error('❌ Error adding school to TiDB Cloud:', error);
            throw new Error(`Failed to add school: ${error.message}`);
        }
    }

    /**
     * Get all schools from TiDB Cloud database
     * This retrieves all schools so we can calculate distances
     */
    static async getAllSchools() {
        try {
            // SQL query to get all schools, ordered by newest first
            const selectQuery = `
                SELECT id, name, address, latitude, longitude, created_at 
                FROM schools 
                ORDER BY created_at DESC
            `;

            // Execute the query
            const [schools] = await pool.execute(selectQuery);

            console.log(`📚 Retrieved ${schools.length} schools from TiDB Cloud`);
            return schools;

        } catch (error) {
            console.error('❌ Error fetching schools from TiDB Cloud:', error);
            throw new Error(`Failed to fetch schools: ${error.message}`);
        }
    }

    /**
     * Check if school already exists (prevent duplicates)
     * We check both name and location to avoid duplicate entries
     */
    static async checkForDuplicateSchool(name, latitude, longitude) {
        try {
            // Check for exact name match OR very close coordinates (within ~100 meters)
            const checkQuery = `
                SELECT id, name 
                FROM schools 
                WHERE name = ? 
                OR (ABS(latitude - ?) < 0.001 AND ABS(longitude - ?) < 0.001)
            `;

            const [existingSchools] = await pool.execute(checkQuery, [name, latitude, longitude]);

            if (existingSchools.length > 0) {
                console.log(`⚠️  Duplicate school found: ${existingSchools[0].name}`);
                return true;
            }

            return false;

        } catch (error) {
            console.error('❌ Error checking duplicates in TiDB Cloud:', error);
            throw new Error(`Failed to check for duplicates: ${error.message}`);
        }
    }

    /**
     * Get a specific school by its ID
     * Useful for getting details of a single school
     */
    static async getSchoolById(schoolId) {
        try {
            const selectQuery = `
                SELECT id, name, address, latitude, longitude, created_at 
                FROM schools 
                WHERE id = ?
            `;

            const [schools] = await pool.execute(selectQuery, [schoolId]);
            return schools[0] || null; // Return first school or null if not found

        } catch (error) {
            console.error('❌ Error fetching school by ID from TiDB Cloud:', error);
            throw new Error(`Failed to fetch school: ${error.message}`);
        }
    }

    /**
     * Get schools within a certain radius (bonus feature)
     * This could be useful for advanced filtering
     */
    static async getSchoolsWithinRadius(centerLat, centerLon, radiusKm) {
        try {
            // This is a more complex query that calculates distance in SQL
            // The formula approximates distance using the Haversine formula
            const radiusQuery = `
                SELECT id, name, address, latitude, longitude, created_at,
                (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
                sin(radians(latitude)))) AS distance
                FROM schools
                HAVING distance < ?
                ORDER BY distance
            `;

            const [schools] = await pool.execute(radiusQuery, [
                centerLat, centerLon, centerLat, radiusKm
            ]);

            return schools;

        } catch (error) {
            console.error('❌ Error fetching schools within radius:', error);
            throw new Error(`Failed to fetch schools within radius: ${error.message}`);
        }
    }
}

export default School;