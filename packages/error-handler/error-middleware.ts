import { AppError } from ".";
import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (err : Error, req : Request, res : Response, next: NextFunction) => {

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(err.details && { details: err.details }),
        });
    }
    console.error("Unhandled Error",err); // Log the error for debugging
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        details: 'An unexpected error occurred. Please try again later.'
    });
}