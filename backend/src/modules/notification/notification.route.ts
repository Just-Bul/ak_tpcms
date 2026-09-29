import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import Role from "../role/role.model.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { notificationQuerySchema, notificationStudentParamSchema } from "./notification.validation.js";
import { notificationGetController } from "./notification.controller.js";

const notificationRouter = Router();

notificationRouter
    .get(
        "/",
        authenticate([Role.Student, Role.Coordinator, Role.SuperAdmin]),
        validate(notificationQuerySchema),
        notificationGetController
    )
    .get(
        "/:student_id",
        authenticate([Role.Student, Role.Coordinator, Role.SuperAdmin]),
        validate(notificationStudentParamSchema.and(notificationQuerySchema)),
        notificationGetController
    );

export default notificationRouter;