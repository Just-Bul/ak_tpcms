import z from "zod";

export const masterTypeSchema = z.object({
    params: z.object({
        type: z.enum(["genders", "semesters", "divisions", "categories", "skills", "sectors"], "Invalid master table type")
    }).strict()
});