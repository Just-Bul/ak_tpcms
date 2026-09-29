import z from "zod";

export const notificationQuerySchema = z.object({
    query: z.object({
        section: z.enum(["training", "placement", "all"]).optional().default("all"),
        filter: z.enum(["all", "eligible", "ineligible", "applied"]).optional().default("all"),
        student_id: z.coerce.number().optional()
    })
});

export const notificationStudentParamSchema = z.object({
    params: z.object({
        student_id: z.coerce.number().optional()
    })
});