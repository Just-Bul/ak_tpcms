import z from "zod";

export const trainingApplicationCreateSchema = z.object({
    body: z.object({
        training_id: z.number({ message: "Training ID must be a number" })
    }).strict()
});

export const trainingApplicationIdParamSchema = z.object({
    params: z.object({
        training_id: z.coerce.number({ message: "training_id must be a number" }),
        student_id: z.coerce.number({ message: "student_id must be a number" }),
    })
});

export const trainingApplicationApproveSchema = z.object({
    body: z.object({
        remarks: z.string("Remark must be a string").optional()
    })
})

export const trainingApplicationQuerySchema = z.object({
    query: z.object({
        status: z.enum(["approve", "reject"])
    })
})

export const updateTrainingApplicationStatusSchema = trainingApplicationIdParamSchema.extend(
    trainingApplicationApproveSchema.shape
).extend(trainingApplicationQuerySchema.shape)