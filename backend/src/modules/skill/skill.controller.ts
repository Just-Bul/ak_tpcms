import type { Request, Response, NextFunction } from "express";
import { getAllSkillService } from "./skill.service.js";

export const getAllSkillController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const skillList = await getAllSkillService();
        res.status(200).json({
            success: true,
            message: `Fetched all skills`,
            data: skillList
        });
    } catch (error) {
        next(error);
    }
}
