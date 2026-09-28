import { Prisma } from "@prisma/client";
import z from "zod";

export const studentRegisterSchema = z.object({
    body: z.object({
        roll_no: z.string({ message: "Roll Number must be of type string" }),
        email: z.email("Invalid email address"),
        password: z.string().min(6, "Password must be atleast 6 characters"),
        name: z.string("Name must be provided as a string"),
        department_id: z.number("Department must be converted to department id"),
        semester_id: z.number("Semester id must be converted to semester id")
    }).strict()
});

export const studentUpdateAdminSchema = z.object({
    body: z.object({
        roll_no: z.string({ message: "Roll Number must be of type string" }).optional(),
        email: z.email("Invalid email address").optional(),
        mobile_no: z.string().length(10, "Phone number should be 10 digits").optional(),
        gender_id: z.number({ message: "Frontend must convert gender text to gender_id" }).optional(),
        name: z.string({ message: "Name must be of type string" }).optional(),
        date_of_birth: z.coerce.date({ message: "Invalid date of birth format" }).optional(),
        has_backlog: z.boolean({ message: "has_backlog must be of type boolean" }).optional(),
        cgpa: z.number({ message: "cgpa must be of type number" }).optional().transform((val) => (val !== undefined ? new Prisma.Decimal(val): undefined)),
        tenth_division_id: z.number({ message: "Frontend must convert tenth_division text to tenth_division_id" }).optional(),
        twelfth_division_id: z.number({ message: "Frontend must convert twelfth_division text to twelfth_division_id" }).optional(),
        category_id: z.number({ message: "Frontend must convert category text to category_id" }).optional(),
        resume_url: z.string({ message: "resume_url must be of type string" }).optional(),
        image_url: z.string({ message: "image_url must be of type string" }).optional(),
        department_id: z.number("Department ID must be number").optional(),
        semester_id: z.number("Semester ID must be number").optional(),
        is_graduate: z.boolean("Must be boolean")
    }).strict()
});

export const studentUpdateSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address").optional(),
        mobile_no: z.string().length(10, "Phone number should be 10 digits").optional(),
        has_backlog: z.boolean({ message: "has_backlog must be of type boolean" }).optional(),
        cgpa: z.number({ message: "cgpa must be of type number" }).optional().transform((val) => (val !== undefined ? new Prisma.Decimal(val): undefined)),
        tenth_division_id: z.number({ message: "Frontend must convert tenth_division text to tenth_division_id" }).optional(),
        twelfth_division_id: z.number({ message: "Frontend must convert twelfth_division text to twelfth_division_id" }).optional(),
        category_id: z.number({ message: "Frontend must convert category text to category_id" }).optional(),
        resume_url: z.string({ message: "resume_url must be of type string" }).optional(),
        image_url: z.string({ message: "image_url must be of type string" }).optional(),
        gender_id: z.number("Gender must be converted to gender id").optional(),
        deprtment_id: z.number("Department must be converted to department id").optional(),
        date_of_birth: z.coerce.date("Invalid date of birth format").optional(),
        semester_id: z.number("Semester must be converted to semester id").optional(),
        name: z.string("Name must be string").optional(),
        skills: z.array(z.string()).optional().default([])
    }).strict()
});

export const studentIdParamSchema = z.object({
    params: z.object({
        user_id: z.coerce.number({ message: "user_id must be a number" })
    })
});