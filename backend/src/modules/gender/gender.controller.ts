import type { Request, Response, NextFunction } from "express";
import { getAllGenderService } from "./gender.service.js";

export const getAllGenderController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const genderList = await getAllGenderService();
        res.status(200).json({
            success: true,
            message: `Fetched all genders`,
            data: genderList
        });
    } catch (error) {
        next(error);
    }
}
