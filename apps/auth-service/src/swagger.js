const swaggerAutogen = require("swagger-autogen");

const doc = {
    info: {
        title: 'Auth Service API',
        description: 'Complete API documentation for the Auth Service with user registration, login, and password management',
        version: '1.0.0',
        contact: {
            name: 'API Support',
            email: 'support@doc24x7.com'
        }
    },
    host: 'localhost:6001',
    basePath: '/api',
    schemes: ['http'],
    securityDefinitions: {
        cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'refresh_token',
            description: 'Refresh token stored in HTTP-only cookie'
        }
    },
    definitions: {
        User: {
            id: 'string',
            email: 'string',
            name: 'string',
            createdAt: 'string',
            updatedAt: 'string'
        },
        Error: {
            message: 'string',
            statusCode: 'number',
            details: 'string'
        }
    }
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.router.ts", "./controllers/auth.controller.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);