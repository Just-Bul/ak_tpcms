import type { Request, Response, NextFunction } from "express";
import { dashboardService } from "./dashboard.service.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";


export const dashboardController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const dashboard = await dashboardService(req.user as UserJwtPayload);
        res.status(200).json({
            success: true,
            message: "Successfully fetched dashboard",
            data: dashboard
        });
    } catch(error) {
        next(error);
    }
}