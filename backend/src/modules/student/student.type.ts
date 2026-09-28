import { Prisma, type student_table } from "@prisma/client";
import type z from "zod";
import type { studentIdParamSchema, studentRegisterSchema, studentUpdateAdminSchema, studentUpdateSchema } from "./student.validation.js";
import type { ParamsDictionary } from "express-serve-static-core";

export interface IStudent extends student_table {};

export type StudentCreateData = Omit<Prisma.student_tableCreateManyInput, 'user_id'> & Omit<Prisma.user_tableCreateManyInput, 'role_id'>;
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>['body'];

export type StudentUpdateData = Prisma.student_tableUncheckedUpdateInput & Prisma.user_tableUncheckedUpdateInput;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>['body'];

export type StudentUpdateAdminInput = z.infer<typeof studentUpdateAdminSchema>['body'];

export type StudentIdParamInput = z.infer<typeof studentIdParamSchema>['params'] & ParamsDictionary;

export type { StudentDashboardOutput } from "../dashboard/dashboard.type.js";

