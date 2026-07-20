import z from "zod";

export const organizationRegisterSchema = z.object({
    body: z.object({
        name: z.string({ message: "Organization name must be a string" }),
        email: z.email("Enter valid email"),
        mobile_no: z.string().length(10, "Phone number must be string with 10 numbers"),
        password: z.string().min(6, "Password must be atleast 6 character"),
        sector_id: z.number("Sector must be converted to sector id").optional()
    }).strict()
});

export const organizationStatusSchema = z.object({
    params: z.object({
        organization_id: z.coerce.number({ message: "organization_id must be a number" })
    }),
    body: z.object({
        approval_id: z.number({ message: "approval_id must be a number" }).refine(val => val === 2 || val === 3, {
            message: "approval_id must be 2 (Approved) or 3 (Rejected)"
        }),
        remarks: z.string("Remark must be a string").optional()
    }).strict()
});

export const organizationIdParamSchema = z.object({
    params: z.object({
        organization_id: z.coerce.number({ message: "organization_id must be a number" })
    })
});

export const organizationQuerySchema = z.object({
    query: z.object({
        status: z.enum(["approved", "pending", "rejected", "all"]).optional()
    })
});

export const organizationUpdateActiveStateSchema = z.object({
    params: z.object({
        organization_id: z.coerce.number({ message: "organization_id must be a number" })
    }),
    query: z.object({
        status: z.enum(["activate", "deactivate"])
    })
})

export const organizationUpdateSchema = z.object({
    params: z.object({
        organization_id: z.coerce.number({ message: "organization_id must be a number" })
    }),
    body: z.object({
        name: z.string().optional(),
        email: z.email("Enter valid email").optional(),
        mobile_no: z.string().length(10, "Phone number must be string with 10 numbers").or(z.literal("")).optional().nullable(),
        sector_id: z.number("Sector must be converted to sector id").optional().nullable()
    }).strict()
});