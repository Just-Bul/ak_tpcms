import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { forgotPasswordSchema, passwordChangeSchema, resetPasswordSchema, userIdParamSchema, userLoginSchema, userRegisterSchema } from "./user.validation.js";
import { forgotPasswordController, getOneUserController, getUserController, loginUserController, passwordChangeController, registerUserController, resetPasswordController } from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import Role from "../role/role.model.js";
import { apiLimit } from "../../middlewares/rate_limitter.middleware.js";

const userRouter = express.Router();

userRouter
.post("/register", validate(userRegisterSchema), registerUserController)
.post("/login", apiLimit, validate(userLoginSchema), loginUserController)
.post("/change-passwrord/:user_id", authenticate(Role.SuperAdmin), validate(passwordChangeSchema.extend(userIdParamSchema.shape)), passwordChangeController)
.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordController)
.post("/reset-password", validate(resetPasswordSchema), resetPasswordController)
.get("/", authenticate(Role.SuperAdmin), getUserController)
.get("/:user_id", authenticate(Role.SuperAdmin), validate(userIdParamSchema), getOneUserController)

export default userRouter;