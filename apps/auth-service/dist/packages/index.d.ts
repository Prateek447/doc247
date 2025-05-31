export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly details: any;
    constructor(message: string, statusCode: number, isOperational: true, details?: any);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string, details?: any);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string, details?: any);
}
export declare class ValidationError extends AppError {
    constructor(message?: string, details?: any);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string, details?: any);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string, details?: any);
}
export declare class DatabaseError extends AppError {
    constructor(message?: string, details?: any);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string, details?: any);
}
//# sourceMappingURL=index.d.ts.map