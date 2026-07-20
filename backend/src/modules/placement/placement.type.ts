import type { placement_table, Prisma } from "@prisma/client";
import type z from "zod";
import type { ParamsDictionary } from "express-serve-static-core";
import type { placementCreateSchema, placementIdParamSchema } from "./placement.validation.js";

export interface IPlacement extends placement_table{};

export interface PlacementCreateData extends Prisma.placement_tableCreateManyInput {
    only_category?: number[],
    only_semester?: number[],
    only_department?: number[]
}
export type PlacementCreateInput = z.infer<typeof placementCreateSchema>['body'];

export type PlacementIdParamInput = z.infer<typeof placementIdParamSchema>['params'] & ParamsDictionary;

export type PlacementEligibilityResult = {
    isEligible: boolean,
    reason: string
};