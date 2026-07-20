import type { Prisma, training_table } from "@prisma/client";
import type z from "zod";
import type { ParamsDictionary } from "express-serve-static-core";
import type { trainingCreateSchema, trainingIdParamSchema } from "./training.validation.js";

export interface ITraining extends training_table{};

export type TrainingCreateData = Prisma.training_tableCreateManyInput & {
    only_semester?: number[];
    only_department?: number[];
};
export type TrainingCreateInput = z.infer<typeof trainingCreateSchema>['body'];

export type TrainingIdParamInput = z.infer<typeof trainingIdParamSchema>['params'] & ParamsDictionary;

export type TrainingEligibilityResult = {
    isEligible: boolean,
    reason: string
};