import { Router } from "express";
import { getAllDivisionController } from "./division.controller.js";

const divisionRoute = Router();

divisionRoute
.get("/", getAllDivisionController)

export default divisionRoute;