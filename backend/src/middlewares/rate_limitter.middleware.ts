import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

interface RateLimitInfo {
    limit: number,
    current: number,
    remaining: number,
    resetTime: Date,
}

export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: (req: Request & {rateLimit: RateLimitInfo}, res: Response) => {
        return {
            success: false,
            code: "TOO_MANY_REQUESTS",
            message: "You have made too many requests. Please wait for some time.",
            retryAfterSeconds: Math.ceil(req.rateLimit.resetTime.getTime() - Date.now()) / 1000
        }
    }
});

export const apiLimit = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 50,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: (req: Request & {rateLimit: RateLimitInfo}, res: Response) => {
        return {
            success: false,
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests, slow down bro.",
            retryAfterSeconds: Math.ceil(req.rateLimit.resetTime.getTime() - Date.now()) / 1000
        }
    }
});