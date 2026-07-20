import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { placementApplicationCreateSchema, placementApplicationIdParamSchema } from "./placement_application.validation.js";
import Role from "../role/role.model.js";
import { approvePlacementApplicationController, createPlacementApplicationController, getOnePlacementApplicationController, viewPlacementApplicationController } from "./placement_application.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";


const placementApplicationRouter = Router();

placementApplicationRouter
.post("/", authenticate(Role.Student), validate(placementApplicationCreateSchema), createPlacementApplicationController)
.patch("/:placement_id/students/:student_id/status", authenticate([Role.Organization, Role.Coordinator, Role.SuperAdmin]), validate(placementApplicationIdParamSchema), approvePlacementApplicationController)
.get("/", authenticate([Role.Student, Role.Organization, Role.Coordinator, Role.SuperAdmin]), viewPlacementApplicationController)
.get("/:placement_id/students/:student_id", authenticate([Role.Organization, Role.Coordinator, Role.Student, Role.SuperAdmin]), validate(placementApplicationIdParamSchema), getOnePlacementApplicationController)

export default placementApplicationRouter;