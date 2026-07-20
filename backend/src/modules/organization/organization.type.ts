import { Prisma, type organization_table } from "@prisma/client";
import type z from "zod";
import type { ParamsDictionary } from "express-serve-static-core";
import type { organizationIdParamSchema, organizationRegisterSchema, organizationStatusSchema, organizationUpdateActiveStateSchema } from "./organization.validation.js";

export interface IOrganization extends organization_table{};
// export interface IOrganization {
//     user_id: number,
//     name: string,
//     approval_id: number,
//     is_active: boolean,
// }

// export type OrganizationCreateData = Pick<IOrganization, 'name'> & Pick<userCreateData, 'email' | 'mobile_no' | 'password'>;
export type OrganizationCreateData = Omit<Prisma.organization_tableCreateManyInput, 'user_id'> & Omit<Prisma.user_tableCreateManyInput, 'role_id'>;
export type OrganizationUpdateData = Partial<Omit<IOrganization, 'user_id'>>;

export type OrganizationRegisterInput = z.infer<typeof organizationRegisterSchema>['body'];
export type OrganizationStatusInput = z.infer<typeof organizationStatusSchema>['body'];

export type OrganizationIdParamInput = z.infer<typeof organizationIdParamSchema>['params'] & ParamsDictionary;

export type OrganizationUpdateActiveStateInput = z.infer<typeof organizationUpdateActiveStateSchema>;