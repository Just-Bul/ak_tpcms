import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { placementCreateSchema, placementIdParamSchema } from "./placement.validation.js";
import Role from "../role/role.model.js";
import { createPlacementController, getOnePlacementController, getPlacementController } from "./placement.controller.js";

const placementRouter = Router();

placementRouter
.post("/", authenticate([Role.Organization, Role.SuperAdmin, Role.Coordinator]), validate(placementCreateSchema), createPlacementController)
.get("/", authenticate([Role.Student, Role.Organization, Role.Coordinator, Role.SuperAdmin]), getPlacementController)
.get("/:placement_id", authenticate([Role.Student, Role.Organization, Role.Coordinator, Role.SuperAdmin]), validate(placementIdParamSchema), getOnePlacementController)

export default placementRouter;