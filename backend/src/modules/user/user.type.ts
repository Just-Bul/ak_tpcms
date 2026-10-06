import z from "zod";
import {Prisma, type user_table} from "@prisma/client";
import type { ParamsDictionary } from "express-serve-static-core";  
import type { forgotPasswordSchema, passwordChangeSchema, resetPasswordSchema, userIdParamSchema, userLoginSchema, userRegisterSchema } from "./user.validation.js";

export interface IUser extends user_table{};

// export interface IUser {
//     user_id: number, 
//     role_id: number,
//     email: string,
//     password: string,
//     auth_token: string,
//     mobile_no: string,
//     created_on: string,
//     updated_on: string,
// }

// export type userCreateData = Pick<IUser, 'email' | 'password' | 'role_id' | 'mobile_no'>;
export type UserCreateData = Prisma.user_tableCreateManyInput;
export type UserRegisterInput = z.infer<typeof userRegisterSchema>['body'];

export type UserLoginInput = z.infer<typeof userLoginSchema>['body'];
export type UserIdParamInput = z.infer<typeof userIdParamSchema>['params'] & ParamsDictionary;

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>['body'];

export type forgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type resetPasswordInput = z.infer<typeof resetPasswordSchema>['body'] & z.infer<typeof resetPasswordSchema>['query'];