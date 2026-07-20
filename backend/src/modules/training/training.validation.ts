import { Prisma } from "@prisma/client";
import z from "zod";

export const trainingCreateSchema = z.object({
    body: z.object({
        title: z.string(),
        description: z.string().optional(),
        min_cgpa: z.number().optional().transform((val) => (val !== undefined ? new Prisma.Decimal(val): undefined)),
        end_date: z.coerce.date().optional(),
        start_date: z.coerce.date().optional(),
        image_url: z.string().optional(),
        last_date_of_submission: z.coerce.date().optional(),
        is_active: z.boolean().optional(),
        only_semester: z.array(z.number("Semester must be converted to semester id")).optional().default([]),
        only_department: z.array(z.number("Department must be converted to department id")).optional().default([])
    }).strict()
})

export const trainingIdParamSchema = z.object({
    params: z.object({
        training_id: z.coerce.number({ message: "training_id must be a number" })
    })
});