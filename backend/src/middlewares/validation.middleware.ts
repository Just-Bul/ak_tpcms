import { type ZodType, ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        }) as any;

        if (parsed.body !== undefined) req.body = parsed.body;
        // if (parsed.query !== undefined) req.query = parsed.query;
        if (parsed.params !== undefined) req.params = parsed.params;

        next();
    } catch (error) {
        res.status(400).json({
            success: false,
            errors: (error instanceof ZodError)? error.issues: `Failed to validate request, ${error}`,
        });
    }
}