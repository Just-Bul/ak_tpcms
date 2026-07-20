import { Router } from "express";
import { getAllCategoryController } from "./category.controller.js";

const categoryRoute = Router();

categoryRoute
.get("/", getAllCategoryController)

export default categoryRoute;