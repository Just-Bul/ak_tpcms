import z from "zod";

export const notificationGetSchema = z.object({
    params: z.object({
        student_id: z.coerce.number(),
        section: z.enum(["training", "placement"])
    }),
    query: z.object({
        type: z.enum(["eligible", "approved"])
    })
})