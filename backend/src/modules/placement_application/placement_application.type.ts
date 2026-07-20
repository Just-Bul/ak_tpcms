import type { placement_application_table, Prisma } from "@prisma/client";
import type z from "zod";
import type { ParamsDictionary } from "express-serve-static-core";
import type { placementApplicationCreateSchema, placementApplicationIdParamSchema } from "./placement_application.validation.js";

export interface IPlacementApplication extends placement_application_table{};


export type PlacementApplicationCreateData = Prisma.placement_application_tableCreateManyInput;
export type PlacementApplicationCreateInput = z.infer<typeof placementApplicationCreateSchema>['body'];

export type PlacementApplicationIdParamInput = z.infer<typeof placementApplicationIdParamSchema>['params'] & ParamsDictionary; 