import type { Request, Response, ErrorRequestHandler, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

export const errorHandler: ErrorRequestHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction
): void =>  {
    const statusCode = err instanceof ApiError? err.statusCode : 500;
    const message = err.message ?? "Internal server error";

    console.error(`[TS-SERVER-ERROR]: ${err}`);

    res.status(statusCode).json({
        success: false,
        message: message
    });
};