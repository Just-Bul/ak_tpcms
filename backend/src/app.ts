import express, { application } from "express";
import cors from "cors";
import userRouter from "./modules/user/user.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import trainingApplicationRouter from "./modules/training_application/training_application.routes.js";
import studentRouter from "./modules/student/student.routes.js";
import trainingRouter from "./modules/training/training.routes.js";
import organizationRouter from "./modules/organization/organization.routes.js";
import departmentRoute from "./modules/department/department.routes.js";
import skillRoute from "./modules/skill/skill.routes.js";
import categoryRoute from "./modules/category/category.routes.js";
import divisionRoute from "./modules/division/division.routes.js";
import genderRoute from "./modules/gender/gender.routes.js";
import semesterRoute from "./modules/semester/semester.routes.js";
import placementRouter from "./modules/placement/placement.routes.js";
import placementApplicationRouter from "./modules/placement_application/placement_application.routes.js";
import dashboardRouter from "./modules/dashboard/dashboard.routes.js";
import uploadRouter from "./modules/upload/upload.route.js";
import { globalRateLimiter } from "./middlewares/rate_limitter.middleware.js";
import masterRouter from "./modules/master/master.routes.js";
import morgan from "morgan";    
import notesRouter from "./modules/notes/notes.route.js";


const app = express();

app.use(morgan("common")); // logger

app.use(cors());
app.use(express.json());
app.use(globalRateLimiter)

app.use("/public", express.static("public"));
app.use("/uploads", uploadRouter);

app.use("/users", userRouter);
app.use("/training-applications", trainingApplicationRouter);
app.use("/students", studentRouter);
app.use("/trainings", trainingRouter);
app.use("/organizations", organizationRouter);
app.use("/departments", departmentRoute);
app.use("/placements", placementRouter);
app.use("/placement-applications", placementApplicationRouter);
app.use("/dashboards", dashboardRouter);
app.use("/notes", notesRouter);

app.use("/masters", masterRouter);

app.use("/skills", skillRoute);
app.use("/categories", categoryRoute);
app.use("/divisions", divisionRoute);
app.use("/genders", genderRoute);
app.use("/semesters", semesterRoute);

app.use(errorHandler);

export default app;
