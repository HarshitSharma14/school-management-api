import express from 'express';
import SchoolController from '../controllers/schoolController.js';

const router = express.Router();

// Add a new school
router.post('/addSchool', SchoolController.addSchool);

// Get schools sorted by proximity
router.get('/listSchools', SchoolController.listSchools);

// NEW: Get schools within a specific radius
router.get('/schoolsNearby', SchoolController.getSchoolsNearby);

// Health check for school routes
router.get('/health', (request, response) => {
    response.status(200).json({
        success: true,
        message: 'School API routes are working! 🏫',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        availableEndpoints: [
            'POST /api/addSchool',
            'GET /api/listSchools',
            'GET /api/schoolsNearby',
            'GET /api/health'
        ]
    });
});

export default router;