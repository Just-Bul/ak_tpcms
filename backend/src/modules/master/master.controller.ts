import type { Request, Response, NextFunction } from "express";
import { masterGetService } from "./master.service.js";


export const masterGetController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { type } = req.params;
        
        const data = await masterGetService(type as string);
        res.status(200).json({
            success: true,
            message: "Successfully fetched master table",
            data: data
        });
    } catch (error) {
        next(error);
    }
}