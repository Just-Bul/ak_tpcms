import type { Request, Response, NextFunction } from "express";
import type z from "zod";
import type { notificationGetSchema } from "./notification.validation.js";
import { notificationGetService } from "./notification.service.js";

export const notificationGetController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { student_id, section } = req.params as unknown as z.infer<typeof notificationGetSchema>['params'];
        const { type } = req.query as unknown as z.infer<typeof notificationGetSchema>['query'];
        const notificationList = await notificationGetService({student_id, section, type});
        res.status(200).json({
            success: true,
            message: "Successfully fetched notifications",
            data: notificationList
        });
    } catch (error) {
        next(error);
    }
}