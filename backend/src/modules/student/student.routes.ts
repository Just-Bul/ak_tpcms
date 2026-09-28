import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { studentIdParamSchema, studentRegisterSchema, studentUpdateAdminSchema, studentUpdateSchema } from "./student.validation.js";
import { getStudentController, registerStudentController, studentUpdateAdminController, updateStudentController, getStudentMeController, getStudentByIdController } from "./student.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import Role from "../role/role.model.js";

const studentRouter = Router();

studentRouter
.post("/", authenticate([Role.SuperAdmin]), validate(studentRegisterSchema), registerStudentController)
.put("/me", authenticate(Role.Student), validate(studentUpdateSchema), updateStudentController)
.get("/me", authenticate([Role.Student]), getStudentMeController)
.put("/:user_id", authenticate(Role.SuperAdmin), validate(studentUpdateAdminSchema.extend(studentIdParamSchema.shape)), studentUpdateAdminController)
.get("/:user_id", authenticate([Role.Student, Role.Coordinator, Role.SuperAdmin]), validate(studentIdParamSchema), getStudentByIdController)
.get("/", authenticate([Role.SuperAdmin, Role.Coordinator]), getStudentController)

export default studentRouter;