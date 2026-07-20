import { z } from "zod";

export const userRegisterSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(6, "Password must be atleast 6 characters"),
        role_id: z.number({ message: "Frontend must convert role text to role_id" }),
        mobile_no: z.string().length(10, "Phone number should be 10 digits").optional(),
        name: z.string("Name must be enetred as a string")
    }).strict()
});

export const userLoginSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(6, "Password must be atleast 6 characters"),
        role_id: z.number({ message: "Frontend must convert role text to role_id" }),
    }).strict()
});

export const userIdParamSchema = z.object({
    params: z.object({
        user_id: z.coerce.number({ message: "user_id must be a number" })
    })
});

export const passwordChangeSchema = z.object({
    body: z.object({
        password: z.string("Password must be string"),
        new_password: z.string("Password must be string").min(6, "Password should be minimum 6 chacaters")
    })
})

export const selfPasswordChangeSchema = z.object({
    body: z.object({
        oldPassword: z.string("Old password must be a string"),
        newPassword: z.string("New password must be a string").min(6, "New password should be minimum 6 characters"),
        confirmPassword: z.string("Confirm password must be a string"),
    }).strict().refine((data) => data.newPassword === data.confirmPassword, {
        message: "New password and confirm password do not match",
        path: ["confirmPassword"],
    })
})

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.email("Email must be provided in body"),
        redirect: z.string("redirect url must be a string")
    })
})

export const resetPasswordSchema = z.object({
    body: z.object({
        password: z.string().min(6, "New password must be at minimum 6 characters"),
    }),
    query: z.object({
        token: z.string("Token must be provided")
    })
})