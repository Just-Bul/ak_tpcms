import type { Request, Response, NextFunction } from "express";
import { getAllSemesterService } from "./semester.service.js";

export const getAllSemesterController= async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const semesterList = await getAllSemesterService();
        res.status(200).json({
            success: true,
            message: `Fetched all departments`,
            data: semesterList
        });
    } catch (error) {
        next(error);
    }
}
