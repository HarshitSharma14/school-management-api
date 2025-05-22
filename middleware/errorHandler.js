/**
 * Global error handler for our School Management API
 * This catches any errors that slip through our controllers
 */
function errorHandler(error, request, response, next) {
    console.error('🚨 Global Error Handler Triggered:', error);
    console.error('📍 Error occurred at:', request.originalUrl);
    console.error('⏰ Timestamp:', new Date().toISOString());

    // Default error response
    let errorResponse = {
        success: false,
        message: 'Something went wrong on our server',
        timestamp: new Date().toISOString(),
        path: request.originalUrl
    };

    // Handle specific MySQL/TiDB errors
    if (error.code === 'ER_DUP_ENTRY') {
        errorResponse.message = 'This data already exists in the database';
        errorResponse.statusCode = 409;
        errorResponse.type = 'DUPLICATE_ENTRY';
    }

    if (error.code === 'ER_BAD_FIELD_ERROR') {
        errorResponse.message = 'Invalid database field or query';
        errorResponse.statusCode = 400;
        errorResponse.type = 'BAD_FIELD';
    }

    if (error.code === 'ECONNREFUSED') {
        errorResponse.message = 'Database connection failed. Please try again later.';
        errorResponse.statusCode = 503;
        errorResponse.type = 'DB_CONNECTION_FAILED';
    }

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        errorResponse.message = 'Database access denied. Please check credentials.';
        errorResponse.statusCode = 503;
        errorResponse.type = 'DB_ACCESS_DENIED';
    }

    // Handle rate limiting errors
    if (error.status === 429) {
        errorResponse.message = 'Too many requests. Please slow down and try again in a few minutes';
        errorResponse.statusCode = 429;
        errorResponse.type = 'RATE_LIMIT_EXCEEDED';
        errorResponse.retryAfter = '15 minutes';
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
        errorResponse.message = 'Invalid input data provided';
        errorResponse.statusCode = 400;
        errorResponse.type = 'VALIDATION_ERROR';
        errorResponse.details = error.details;
    }

    // Handle JSON parsing errors
    if (error.type === 'entity.parse.failed') {
        errorResponse.message = 'Invalid JSON format in request body';
        errorResponse.statusCode = 400;
        errorResponse.type = 'INVALID_JSON';
    }

    // Add helpful suggestions for common errors
    if (errorResponse.statusCode === 400) {
        errorResponse.suggestion = 'Please check your request format and try again';
    }

    if (errorResponse.statusCode === 503) {
        errorResponse.suggestion = 'This is a temporary issue. Please try again in a few minutes';
    }

    // In development, include full error details
    if (process.env.NODE_ENV === 'development') {
        errorResponse.debug = {
            stack: error.stack,
            fullError: error
        };
    }

    // Send error response
    const statusCode = errorResponse.statusCode || 500;
    response.status(statusCode).json(errorResponse);
}

export default errorHandler;