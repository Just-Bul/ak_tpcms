import type { Prisma, training_application_table } from "@prisma/client";
import type z from "zod";
import type { ParamsDictionary } from "express-serve-static-core";
import type { trainingApplicationApproveSchema, trainingApplicationCreateSchema, trainingApplicationIdParamSchema, trainingApplicationQuerySchema, updateTrainingApplicationStatusSchema } from "./training_application.validation.js";

export interface ITrainingApplication extends training_application_table{};

// export type TrainingApplicationCreateData = Pick<ITrainingApplication, 'student_id' | 'training_id'>;
export type TrainingApplicationCreateData = Prisma.training_application_tableCreateManyInput;
export type TrainingApplicationCreateInput = z.infer<typeof trainingApplicationCreateSchema>['body'];

export type trainingApplicationIdParamInput = z.infer<typeof trainingApplicationIdParamSchema>['params'] & ParamsDictionary; 
export type trainingApplicationApproveData = z.infer<typeof trainingApplicationApproveSchema>['body'];

export type updateTrainingApplicationStatusInput = z.infer<typeof updateTrainingApplicationStatusSchema>['body'];

export type trainingApplicationQueryInput = z.infer<typeof trainingApplicationQuerySchema>['query'];