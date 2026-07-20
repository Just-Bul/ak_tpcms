import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import Role from "../role/role.model.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { notesCreateSchema, notesIdParamSchema } from "./notes.validation.js";
import { noteCreateController, noteGetAllController } from "./notes.controller.js";
import { noteGetByCreatorService, noteGetOneService } from "./notes.service.js";


const notesRouter = Router();

notesRouter
.post("/", authenticate([Role.Coordinator, Role.SuperAdmin, Role.Organization]), validate(notesCreateSchema), noteCreateController)
.get("/", noteGetAllController)
.get("/me", authenticate([Role.SuperAdmin, Role.Organization, Role.Coordinator]), noteGetByCreatorService)
.get("/:note_id", validate(notesIdParamSchema), noteGetOneService)

export default notesRouter;