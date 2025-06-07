export class AppError extends Error {

    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details: any;

    constructor( message: string, statusCode: number, isOperational: true, details?: any ){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details; 
        Error.captureStackTrace(this);
    }
}


export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found', details?: any) {
        super(message, 404, true, details);
        this.name = 'NotFoundError';
    }
}
export class BadRequestError extends AppError {
    constructor(message: string = 'Bad request', details?: any) {
        super(message, 400, true, details);
        this.name = 'BadRequestError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation error', details?: any) {
        super(message, 422, true, details);
        this.name = 'ValidationError';
    }
}
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized', details?: any) {
        super(message, 401, true, details);
        this.name = 'UnauthorizedError';
    }
}
export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden', details?: any) {
        super(message, 403, true, details);
        this.name = 'ForbiddenError';
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = 'Database error', details?: any) {
        super(message, 500, true, details);
        this.name = 'DatabaseError';
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Rate limit exceeded', details?: any) {
        super(message, 429, true, details);
        this.name = 'RateLimitError';
    }
}

