import type { Request, Response, NextFunction } from "express";
import { getAllDivisonService } from "./division.service.js";

export const getAllDivisionController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => { 
    try {
        const divisionList = await getAllDivisonService();
        res.status(200).json({
            success: true,
            message: `Fetched all divisions`,
            data: divisionList
        });
    } catch (error) {
        next(error);
    }
}
