import { Prisma, type student_table } from "@prisma/client";
import type z from "zod";
import type { studentIdParamSchema, studentRegisterSchema, studentUpdateAdminSchema, studentUpdateSchema } from "./student.validation.js";
import type { ParamsDictionary } from "express-serve-static-core";

export interface IStudent extends student_table {};

export type StudentCreateData = {
    roll_no: string;
    email: string;
    password: string;
    name: string;
    department_id?: number | null | undefined;
    semester_id?: number | null | undefined;
    graduation?: boolean | undefined;
    is_graduate?: boolean | undefined;
    graduation_year?: number | null | undefined;
    grade_card_url?: string | null | undefined;
    has_backlog?: boolean | undefined;
};
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>['body'];

export type StudentUpdateData = Prisma.student_tableUncheckedUpdateInput & Prisma.user_tableUncheckedUpdateInput;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>['body'];

export type StudentUpdateAdminInput = z.infer<typeof studentUpdateAdminSchema>['body'];

export type StudentIdParamInput = z.infer<typeof studentIdParamSchema>['params'] & ParamsDictionary;

export type { StudentDashboardOutput } from "../dashboard/dashboard.type.js";

