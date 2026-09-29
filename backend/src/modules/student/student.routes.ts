import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { 
    studentDocumentCreateSchema, 
    studentDocumentParamSchema, 
    studentDocumentVerifySchema, 
    studentIdParamSchema, 
    studentQuerySchema, 
    studentRegisterSchema, 
    studentUpdateAdminSchema, 
    studentUpdateSchema 
} from "./student.validation.js";
import { 
    getStudentController, 
    registerStudentController, 
    studentUpdateAdminController, 
    updateStudentController, 
    getStudentMeController, 
    getStudentByIdController,
    addStudentDocumentController,
    getStudentDocumentsMeController,
    getStudentDocumentsByUserIdController,
    deleteStudentDocumentController,
    verifyStudentDocumentController
} from "./student.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import Role from "../role/role.model.js";

const studentRouter = Router();

// Student self routes
studentRouter
    .get("/me", authenticate([Role.Student]), getStudentMeController)
    .put("/me", authenticate(Role.Student), validate(studentUpdateSchema), updateStudentController);

// Student documents repository routes (must precede /:user_id)
studentRouter
    .post("/documents", authenticate([Role.Student, Role.SuperAdmin, Role.Coordinator]), validate(studentDocumentCreateSchema), addStudentDocumentController)
    .get("/documents/me", authenticate([Role.Student]), getStudentDocumentsMeController)
    .delete("/documents/:document_id", authenticate([Role.Student, Role.SuperAdmin]), validate(studentDocumentParamSchema), deleteStudentDocumentController)
    .patch("/documents/:document_id/verify", authenticate([Role.SuperAdmin, Role.Coordinator]), validate(studentDocumentParamSchema.and(studentDocumentVerifySchema)), verifyStudentDocumentController);

// List all students with query filters
studentRouter
    .get("/", authenticate([Role.SuperAdmin, Role.Coordinator]), validate(studentQuerySchema), getStudentController)
    .post("/", authenticate([Role.SuperAdmin]), validate(studentRegisterSchema), registerStudentController);

// Specific student by user_id routes
studentRouter
    .get("/:user_id/documents", authenticate([Role.Student, Role.Coordinator, Role.SuperAdmin]), validate(studentIdParamSchema), getStudentDocumentsByUserIdController)
    .get("/:user_id", authenticate([Role.Student, Role.Coordinator, Role.SuperAdmin]), validate(studentIdParamSchema), getStudentByIdController)
    .put("/:user_id", authenticate(Role.SuperAdmin), validate(studentUpdateAdminSchema.extend(studentIdParamSchema.shape)), studentUpdateAdminController);

export default studentRouter;