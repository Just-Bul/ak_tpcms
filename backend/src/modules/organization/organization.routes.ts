import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { organizationIdParamSchema, organizationQuerySchema, organizationRegisterSchema, organizationStatusSchema, organizationUpdateActiveStateSchema, organizationUpdateSchema } from "./organization.validation.js";
import { getOneOrganizationController, getOrganizationsController, registerOrganizationController, updateOrganizationActiveStateController, updateOrganizationStatusController, updateOrganizationController } from "./organization.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import Role from "../role/role.model.js";

const organizationRouter = Router();

organizationRouter
.post("/", validate(organizationRegisterSchema), registerOrganizationController)
.patch("/:organization_id/status", authenticate([Role.SuperAdmin]), validate(organizationStatusSchema), updateOrganizationStatusController)
.get("/", authenticate(Role.SuperAdmin), validate(organizationQuerySchema), getOrganizationsController)
.get("/:organization_id", authenticate([Role.Student, Role.Coordinator, Role.SuperAdmin]), validate(organizationIdParamSchema), getOneOrganizationController)
.delete("/:organization_id", authenticate([Role.SuperAdmin]), validate(organizationUpdateActiveStateSchema), updateOrganizationActiveStateController)
.put("/:organization_id", authenticate([Role.Organization]), validate(organizationUpdateSchema), updateOrganizationController)

export default organizationRouter;