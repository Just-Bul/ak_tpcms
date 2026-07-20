import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import Role from "../role/role.model.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { departmentIdParamSchema, departmentRegisterSchema, departmentUpdateActiveStateSchema, departmentUpdateSchema } from "./department.validation.js";
import { departmentRegisterController, departmentUpdateController, getAllDepartmentController, updateDepartmentActiveStateController } from "./department.controller.js";


const departmentRoute = Router();

departmentRoute
.post("/register", authenticate(Role.SuperAdmin), validate(departmentRegisterSchema), departmentRegisterController)
.get("/", getAllDepartmentController)
.patch("/:department_id", authenticate(Role.SuperAdmin), validate(departmentUpdateSchema.extend(departmentIdParamSchema.shape)), departmentUpdateController)
.delete("/:department_id", authenticate(Role.SuperAdmin), validate(departmentUpdateActiveStateSchema), updateDepartmentActiveStateController)
// .delete("/:department_id")

export default departmentRoute;