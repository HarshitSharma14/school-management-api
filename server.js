import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import our custom modules
import { testConnection } from './config/database.js';
import schoolRoutes from './routes/schools.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting School Management API with TiDB Cloud...');
console.log('📦 Using ES Modules (Modern JavaScript)');

// Security middleware
app.use(helmet());

// CORS configuration
// CORS configuration for production
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [
            process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
            'https://your-school-api.vercel.app',
            'https://your-school-api.onrender.com'
        ]
        : [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'http://127.0.0.1:3000'
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Maximum 100 requests per 15 minutes per IP
    message: {
        success: false,
        message: 'Too many requests from your IP address. Please try again in 15 minutes.'
    }
});
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((request, response, next) => {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.originalUrl;

    console.log(`📝 ${timestamp} - ${method} ${url}`);
    next();
});

// Root endpoint - API welcome message
// In server.js, update the root endpoint
app.get('/', (request, response) => {
    response.status(200).json({
        success: true,
        message: 'Welcome to School Management API! 🏫📚',
        version: '1.0.0',
        database: 'TiDB Cloud MySQL',
        endpoints: {
            addSchool: 'POST /api/addSchool',
            listSchools: 'GET /api/listSchools?latitude={lat}&longitude={lon}',
            schoolsNearby: 'GET /api/schoolsNearby?latitude={lat}&longitude={lon}&radius={km}', // NEW
            health: 'GET /health'
        },
        examples: {
            addSchool: {
                url: 'POST /api/addSchool',
                body: 'JSON with name, address, latitude, longitude'
            },
            listSchools: {
                url: 'GET /api/listSchools?latitude=28.6139&longitude=77.2090',
                description: 'Get all schools sorted by distance'
            },
            schoolsNearby: { // NEW
                url: 'GET /api/schoolsNearby?latitude=28.6139&longitude=77.2090&radius=10',
                description: 'Get schools within 10km radius'
            }
        }
    });
});
// Health check endpoint
app.get('/health', async (request, response) => {
    try {
        const dbConnected = await testConnection();

        response.status(200).json({
            success: true,
            message: 'School Management API is healthy! ✅',
            timestamp: new Date().toISOString(),
            database: {
                status: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
                provider: 'TiDB Cloud'
            },
            uptime: `${Math.floor(process.uptime())} seconds`
        });

    } catch (error) {
        response.status(503).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Mount API routes
app.use('/api', schoolRoutes);

// 404 handler - FIXED: Simplified route pattern
app.use((request, response) => {
    response.status(404).json({
        success: false,
        message: `The endpoint '${request.originalUrl}' was not found`,
        availableEndpoints: [
            'GET /',
            'GET /health',
            'POST /api/addSchool',
            'GET /api/listSchools',
            'GET /api/health'
        ]
    });
});

// Global error handling middleware
app.use(errorHandler);

// Server startup function
async function startServer() {
    try {
        console.log('🔄 Testing TiDB Cloud connection...');

        const isConnected = await testConnection();

        if (!isConnected) {
            console.error('❌ Cannot start server without database connection');
            process.exit(1);
        }

        // Start the server
        app.listen(PORT, () => {
            console.log('');
            console.log('🎉 School Management API is running successfully!');
            console.log(`🌐 Server URL: http://localhost:${PORT}`);
            console.log(`📋 API Documentation: http://localhost:${PORT}`);
            console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
            console.log(`🏫 Add School: POST http://localhost:${PORT}/api/addSchool`);
            console.log(`📍 List Schools: GET http://localhost:${PORT}/api/listSchools`);
            console.log('');
            console.log('Press Ctrl+C to stop the server');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();

export default app;