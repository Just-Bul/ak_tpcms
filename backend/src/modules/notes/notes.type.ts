import type z from "zod";
import type { notesCreateSchema, notesIdParamSchema } from "./notes.validation.js";

export type NotesCreateInput = z.infer<typeof notesCreateSchema>['body'];
export type NotesIdParamInput = z.infer<typeof notesIdParamSchema>['params'];