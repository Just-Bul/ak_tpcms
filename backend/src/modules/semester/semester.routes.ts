import { Router } from "express";
import { getAllSemesterController } from "./semester.controller.js";

const semesterRoute = Router();

semesterRoute
.get("/", getAllSemesterController)

export default semesterRoute;