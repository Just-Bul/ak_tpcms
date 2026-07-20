import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import Role from "../role/role.model.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {  createTrainingApplicationController, getOneTrainingApplicationController, updateTrainingApplicationStatusController, viewTrainingApplicationController } from "./training_application.controller.js";
import { trainingApplicationCreateSchema, trainingApplicationIdParamSchema, updateTrainingApplicationStatusSchema } from "./training_application.validation.js";

const trainingApplicationRouter = Router();

trainingApplicationRouter
.post("/", authenticate(Role.Student), validate(trainingApplicationCreateSchema), createTrainingApplicationController)
.patch("/:training_id/students/:student_id", authenticate([Role.Organization, Role.Coordinator, Role.SuperAdmin]), validate(updateTrainingApplicationStatusSchema), updateTrainingApplicationStatusController)
.get("/", authenticate([Role.Student, Role.Organization, Role.Coordinator, Role.SuperAdmin]), viewTrainingApplicationController)
.get("/:training_id/students/:student_id", authenticate([Role.Organization, Role.Coordinator, Role.Student, Role.SuperAdmin]), validate(trainingApplicationIdParamSchema), getOneTrainingApplicationController)

export default trainingApplicationRouter;