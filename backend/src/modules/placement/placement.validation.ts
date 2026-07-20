import { Prisma } from "@prisma/client";
import z from "zod";

export const placementCreateSchema = z.object({
    body: z.object({
        title: z.string(),
        description: z.string().optional(),
        min_cgpa: z.number().optional().transform((val) => (val !== undefined ? new Prisma.Decimal(val): undefined)),
        image_url: z.string().optional(),
        last_date_of_submission: z.coerce.date().optional(),
        is_active: z.boolean().optional(),
        min_tenth_division_id: z.number("Must be division id").optional(),
        min_twelfth_division_id: z.number("Must be division id").optional(),
        has_backlog: z.boolean("Must be true or false").optional(),
        salary_lower: z.number("Must be a number").optional(),
        salary_upper: z.number("Must be a number").optional(),
        only_category: z.array(z.number("Category must be converted to category id")).optional().default([]),
        only_semester: z.array(z.number("Semester must be converted to semester id")).optional().default([]),
        only_department: z.array(z.number("Department must be converted to department id")).optional().default([]),
        end_date: z.coerce.date().optional(),
        start_date: z.coerce.date().optional()
    }).strict()
})

export const placementIdParamSchema = z.object({
    params: z.object({
        placement_id: z.coerce.number({ message: "placement_id must be a number" })
    })
});