import School from '../models/School.js';
import { addSchoolValidation, listSchoolsValidation } from '../utils/validation.js';
import { calculateDistance } from '../utils/distance.js';

class SchoolController {
    /**
     * Add new school to TiDB Cloud database
     * POST /api/addSchool
     */
    static async addSchool(request, response) {
        try {
            console.log('📝 Processing new school addition...');

            const { error, value } = addSchoolValidation.validate(request.body);

            if (error) {
                console.log('⚠️  Validation failed:', error.details[0].message);
                return response.status(400).json({
                    success: false,
                    message: 'Please check your input data',
                    errors: error.details.map(detail => detail.message)
                });
            }

            const { name, address, latitude, longitude } = value;

            const isDuplicate = await School.checkForDuplicateSchool(name, latitude, longitude);

            if (isDuplicate) {
                return response.status(409).json({
                    success: false,
                    message: 'A school with this name or location already exists in our database'
                });
            }

            const newSchool = await School.createNewSchool({
                name,
                address,
                latitude,
                longitude
            });

            response.status(201).json({
                success: true,
                message: 'School successfully added to database! 🎉',
                data: newSchool,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Add School Error:', error);
            response.status(500).json({
                success: false,
                message: 'Something went wrong while adding the school',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get schools sorted by distance from user location
     * GET /api/listSchools?latitude=28.6139&longitude=77.2090
     */
    static async listSchools(request, response) {
        try {
            console.log('📍 Processing school list request...');

            const { error, value } = listSchoolsValidation.validate({
                latitude: parseFloat(request.query.latitude),
                longitude: parseFloat(request.query.longitude)
            });

            if (error) {
                console.log('⚠️  Location validation failed:', error.details[0].message);
                return response.status(400).json({
                    success: false,
                    message: 'Please provide valid latitude and longitude coordinates',
                    errors: error.details.map(detail => detail.message)
                });
            }

            const { latitude: userLatitude, longitude: userLongitude } = value;

            const allSchools = await School.getAllSchools();

            if (allSchools.length === 0) {
                return response.status(200).json({
                    success: true,
                    message: 'No schools found in the database',
                    data: [],
                    userLocation: {
                        latitude: userLatitude,
                        longitude: userLongitude
                    }
                });
            }

            const schoolsWithDistance = allSchools.map(school => {
                const distanceInKm = calculateDistance(
                    userLatitude,
                    userLongitude,
                    school.latitude,
                    school.longitude
                );

                return {
                    id: school.id,
                    name: school.name,
                    address: school.address,
                    latitude: school.latitude,
                    longitude: school.longitude,
                    distance: Math.round(distanceInKm * 100) / 100,
                    distanceUnit: 'km',
                    created_at: school.created_at
                };
            });

            schoolsWithDistance.sort((schoolA, schoolB) => schoolA.distance - schoolB.distance);

            response.status(200).json({
                success: true,
                message: `Found ${schoolsWithDistance.length} schools, sorted by proximity to your location`,
                data: schoolsWithDistance,
                userLocation: {
                    latitude: userLatitude,
                    longitude: userLongitude
                },
                summary: {
                    totalSchools: schoolsWithDistance.length,
                    closestSchool: schoolsWithDistance[0]?.name || 'None',
                    closestDistance: schoolsWithDistance[0]?.distance || 0,
                    farthestSchool: schoolsWithDistance[schoolsWithDistance.length - 1]?.name || 'None',
                    farthestDistance: schoolsWithDistance[schoolsWithDistance.length - 1]?.distance || 0
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ List Schools Error:', error);
            response.status(500).json({
                success: false,
                message: 'Something went wrong while fetching schools',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get schools within a specific radius
     * GET /api/schoolsNearby?latitude=28.6139&longitude=77.2090&radius=10
     */
    static async getSchoolsNearby(request, response) {
        try {
            console.log('🔍 Processing nearby schools request...');
            console.log('📍 Query parameters:', request.query);

            const { latitude, longitude, radius = 50 } = request.query;

            if (!latitude || !longitude) {
                return response.status(400).json({
                    success: false,
                    message: 'Please provide both latitude and longitude',
                    example: 'GET /api/schoolsNearby?latitude=28.6139&longitude=77.2090&radius=10',
                    requiredParams: ['latitude', 'longitude'],
                    optionalParams: ['radius (default: 50km)']
                });
            }

            const userLat = parseFloat(latitude);
            const userLon = parseFloat(longitude);
            const radiusKm = parseFloat(radius);

            if (isNaN(userLat) || isNaN(userLon) || isNaN(radiusKm)) {
                return response.status(400).json({
                    success: false,
                    message: 'Invalid coordinates or radius provided',
                    errors: [
                        'Latitude and longitude must be valid numbers',
                        'Radius must be a valid number'
                    ]
                });
            }

            if (userLat < -90 || userLat > 90 || userLon < -180 || userLon > 180) {
                return response.status(400).json({
                    success: false,
                    message: 'Invalid coordinate ranges',
                    errors: [
                        'Latitude must be between -90 and 90',
                        'Longitude must be between -180 and 180'
                    ]
                });
            }

            if (radiusKm <= 0 || radiusKm > 20000) {
                return response.status(400).json({
                    success: false,
                    message: 'Invalid radius',
                    errors: ['Radius must be between 0.1 and 20000 kilometers']
                });
            }

            console.log(`📍 Searching within ${radiusKm}km of (${userLat}, ${userLon})`);

            const allSchools = await School.getAllSchools();

            if (allSchools.length === 0) {
                return response.status(200).json({
                    success: true,
                    message: 'No schools found in database',
                    data: [],
                    searchCriteria: {
                        latitude: userLat,
                        longitude: userLon,
                        radius: radiusKm,
                        unit: 'km'
                    }
                });
            }

            const nearbySchools = [];

            for (const school of allSchools) {
                const distance = calculateDistance(
                    userLat,
                    userLon,
                    school.latitude,
                    school.longitude
                );

                if (distance <= radiusKm) {
                    nearbySchools.push({
                        id: school.id,
                        name: school.name,
                        address: school.address,
                        latitude: school.latitude,
                        longitude: school.longitude,
                        distance: Math.round(distance * 100) / 100,
                        distanceUnit: 'km',
                        created_at: school.created_at
                    });
                }
            }

            nearbySchools.sort((a, b) => a.distance - b.distance);

            console.log(`✅ Found ${nearbySchools.length} schools within ${radiusKm}km`);

            response.status(200).json({
                success: true,
                message: `Found ${nearbySchools.length} schools within ${radiusKm} km of your location`,
                data: nearbySchools,
                searchCriteria: {
                    latitude: userLat,
                    longitude: userLon,
                    radius: radiusKm,
                    unit: 'km'
                },
                summary: {
                    totalSchoolsInRadius: nearbySchools.length,
                    totalSchoolsInDatabase: allSchools.length,
                    closestSchool: nearbySchools[0]?.name || 'None',
                    closestDistance: nearbySchools[0]?.distance || 0,
                    farthestInRadius: nearbySchools[nearbySchools.length - 1]?.name || 'None',
                    farthestDistance: nearbySchools[nearbySchools.length - 1]?.distance || 0
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Nearby Schools Error:', error);
            response.status(500).json({
                success: false,
                message: 'Something went wrong while searching for nearby schools',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}

export default SchoolController;