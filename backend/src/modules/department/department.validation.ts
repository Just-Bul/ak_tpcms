import z from "zod";

export const departmentRegisterSchema = z.object({
    body: z.object({
        department_name: z.string({ message: "Department name must be a string" }),
        is_active: z.boolean({ message: "Active status must be a boolean value" }).optional(),
        name: z.string("Name must be string"),
        email: z.email("Incorrect email format"),
        password: z.string().min(6, "Minimum 6 characters must be their for password")
    }).strict()
    
});

export const departmentUpdateSchema = z.object({
    body: z.object({
        department_name: z.string({ message: "Department name must be a string" }).optional(),
        is_active: z.boolean({ message: "Active status must be a boolean value" }).optional(),
        name: z.string("Name must be string").optional(),
        email: z.email("Incorrect email format").optional(),
    }).strict()
});

export const departmentIdParamSchema = z.object({
    params: z.object({
        department_id: z.number("Department id must be a number")
    }).strict()
})

export const departmentUpdateActiveStateSchema = z.object({
    params: z.object({
        department_id: z.coerce.number({ message: "department_id must be a number" })
    }),
    query: z.object({
        status: z.enum(["activate", "deactivate"])
    })
})