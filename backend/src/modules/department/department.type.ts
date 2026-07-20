import type { department_table, Prisma } from "@prisma/client";
import type z from "zod";
import type { departmentIdParamSchema, departmentRegisterSchema, departmentUpdateActiveStateSchema, departmentUpdateSchema } from "./department.validation.js";

export interface IDepartment extends department_table {};
// export interface IDepartment {
//     department_id: number,
//     dept_name: string,
//     is_active: boolean,
// }

export type CreateDepartmentData = Omit<IDepartment, 'department_id'>;

export type { DepartmentDashboardOutput } from "../dashboard/dashboard.type.js";

export type DepartmentRegisterInput = z.infer<typeof departmentRegisterSchema>['body'];
export type DepartmentRegisterData = DepartmentRegisterInput;

export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>['body'];
export type DepartmentUpdateData = Partial<Prisma.department_tableCreateInput> & Partial<Prisma.user_tableCreateInput>

export type DepartmentIdParamInput = z.infer<typeof departmentIdParamSchema>['params'];

export type DepartmentUpdateActiveStateInput = z.infer<typeof departmentUpdateActiveStateSchema>;