import z from "zod";

export const placementApplicationCreateSchema = z.object({
    body: z.object({
        placement_id: z.number({ message: "Placement ID must be a number" })
    }).strict()
});

export const placementApplicationIdParamSchema = z.object({
    params: z.object({
        placement_id: z.coerce.number({ message: "placement_id must be a number" }),
        student_id: z.coerce.number({ message: "student_id must be a number" }),
    })
});