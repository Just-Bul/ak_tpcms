import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import Role from "../role/role.model.js";
import { trainingCreateSchema, trainingIdParamSchema } from "./training.validation.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createTrainingController, disableOneTrainingController, getOneTrainingController, getTrainingController } from "./training.controller.js";

const trainingRouter = Router();

trainingRouter
.post("/", authenticate([Role.Organization, Role.SuperAdmin, Role.Coordinator]), validate(trainingCreateSchema), createTrainingController)
.get("/", authenticate([Role.Student, Role.Organization, Role.Coordinator, Role.SuperAdmin]), getTrainingController)
.get("/:training_id", authenticate([Role.Student, Role.Organization, Role.Coordinator, Role.SuperAdmin]), validate(trainingIdParamSchema), getOneTrainingController)
.delete("/:training_id", authenticate([Role.Organization, Role.Coordinator, Role.SuperAdmin]), validate(trainingIdParamSchema), disableOneTrainingController)

export default trainingRouter;