import type { Request, Response, NextFunction } from "express";
import { Jwt, type UserJwtPayload } from "../utils/jwt.util.js";
import ApiError from "../utils/ApiError.js";

declare global {
    namespace Express {
        interface Request {
            user?: UserJwtPayload
        }
    }
}

export const authenticate = (allowedRoleIds: number | number[]) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Authorization token is missing or malformed");
        }

        const token = authHeader.split(" ")[1];

        const decoded = Jwt.verify(token ?? "");
        if (!decoded) {
            throw new ApiError(401, "Invalid or expired token");
        }
        req.user = decoded;

        if (allowedRoleIds !== undefined) {
            const allowedRoles = Array.isArray(allowedRoleIds) ? allowedRoleIds : [allowedRoleIds];

            if (!allowedRoles.includes(decoded.auth_role_id)) {
                throw new ApiError(403, "Forbidden: You do not have permission to access this resource");
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}