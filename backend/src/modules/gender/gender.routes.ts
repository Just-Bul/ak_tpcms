import { Router } from "express";
import { getAllGenderController } from "./gender.controller.js";

const genderRoute = Router();

genderRoute
.get("/", getAllGenderController)

export default genderRoute;