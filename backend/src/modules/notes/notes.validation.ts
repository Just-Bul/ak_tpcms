import z from "zod";

export const notesCreateSchema = z.object({
    body: z.object({
        title: z.string("Title must be a string"),
        description: z.string("Description must be a string").optional(),
        note_url: z.string("Must be a url after upload")
    }).strict()
});

export const notesIdParamSchema = z.object({
    params: z.object({
        note_id: z.number("Note Id must be number")
    })
})