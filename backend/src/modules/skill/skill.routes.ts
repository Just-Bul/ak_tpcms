import { Router } from "express";
import { getAllSkillController } from "./skill.controller.js";

const skillRoute = Router();

skillRoute
.get("/", getAllSkillController)

export default skillRoute;