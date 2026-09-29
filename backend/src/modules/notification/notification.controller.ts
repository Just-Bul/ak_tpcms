import type { Request, Response, NextFunction } from "express";
import { notificationGetService } from "./notification.service.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import Role from "../role/role.model.js";

export const notificationGetController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const actor = req.user as UserJwtPayload;
        let studentId = actor.auth_user_id;

        // If user is SuperAdmin or Coordinator and provides student_id in params or query
        const paramStudentId = req.params.student_id ? Number(req.params.student_id) : undefined;
        const queryStudentId = req.query.student_id ? Number(req.query.student_id) : undefined;

        if (actor.auth_role_id === Role.SuperAdmin || actor.auth_role_id === Role.Coordinator) {
            studentId = paramStudentId ?? queryStudentId ?? actor.auth_user_id;
        } else if (paramStudentId && paramStudentId !== actor.auth_user_id) {
            // Students can only view their own notifications
            studentId = actor.auth_user_id;
        }

        const section = (req.query.section as "training" | "placement" | "all") || "all";
        const filter = (req.query.filter as "all" | "eligible" | "ineligible" | "applied") || "all";

        const notificationList = await notificationGetService({
            student_id: studentId,
            section,
            filter
        });

        res.status(200).json({
            success: true,
            message: "Successfully fetched notifications",
            data: notificationList
        });
    } catch (error) {
        next(error);
    }
};