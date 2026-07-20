import {Router} from "express";
import { masterGetController } from "./master.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { masterTypeSchema } from "./master.validation.js";

const masterRouter = Router();

masterRouter
.get("/:type", validate(masterTypeSchema), masterGetController)

export default masterRouter;