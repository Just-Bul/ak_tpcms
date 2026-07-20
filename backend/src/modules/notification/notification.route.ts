import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import Role from "../role/role.model.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { notificationGetSchema } from "./notification.validation.js";
import { notificationGetController } from "./notification.controller.js";

const notificationRouter = Router();

notificationRouter
.get("/:student_id", authenticate(Role.Student), validate(notificationGetSchema), notificationGetController)

export default notificationRouter;