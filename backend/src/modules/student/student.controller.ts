import type { Request, Response, NextFunction } from "express";
import { registerStudentService, updateStudentAdminService, updateStudentService, getStudentByIdService, getStudentService } from "./student.service.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import Student from "./student.model.js";
import type { StudentIdParamInput, StudentRegisterInput, StudentUpdateAdminInput, StudentUpdateInput } from "./student.type.js";
import Data from "../../utils/data.util.js";

export const registerStudentController = async (
    req: Request<{}, {}, StudentRegisterInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const newStudent = await registerStudentService(req.body, req.user as UserJwtPayload);
        res.status(201).json({
            success: true,
            message: `Student with roll: ${newStudent.roll_no} created`,
            data: Data.sanitize(newStudent)
        });
    } catch (error) {
        next(error);
    }
}

export const updateStudentController = async (
    req: Request<{}, {}, StudentUpdateInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const newStudent = await updateStudentService(req.body, req.user as UserJwtPayload);
        res.status(200).json({
            success: true,
            message: `Student with roll: ${newStudent.roll_no} updated`,
            data: Data.sanitize(newStudent)
        });
    } catch (error) {
        next(error);
    }
}

export const studentUpdateAdminController = async (
    req: Request<{}, {}, StudentUpdateAdminInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { user_id: student_id } = req.params as StudentIdParamInput;
        const newStudent = await updateStudentAdminService(student_id, req.body, req.user as UserJwtPayload);
        res.status(200).json({
            success: true,
            message: `Student with roll: ${newStudent.roll_no} updated`,
            data: Data.sanitize(newStudent)
        });
    } catch (error) {
        next(error);
    }
}

export const getStudentController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const studentList = await getStudentService(req.user as UserJwtPayload);
        const sanitizedList = studentList.map((student) => Data.sanitize(student));
        res.status(200).json({
            success: true,
            message: "Successfully fetched students",
            data: sanitizedList
        });
    } catch (error) {
        next(error);
    }
}

export const getStudentMeController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const actor = req.user as UserJwtPayload;
        const student = await getStudentByIdService(actor.auth_user_id, actor);
        res.status(200).json({
            success: true,
            message: "Successfully fetched profile",
            data: {
                name: student.user_table.name,
                mobile_no: student.user_table.mobile_no,
                email: student.user_table.email,
                department: student.department_table?.department_name,
                category: student.category_table?.category,
                gender: student.gender_table?.gender,
                cgpa: student.cgpa,
                semester: student.semester_table?.semester,
                skill: student.student_skill_table.map((skill) => skill.skill_table.skill),
                tenth_division: student.division_table_student_table_tenth_division_idTodivision_table?.division,
                twelfth_division: student.division_table_student_table_twelfth_division_idTodivision_table?.division,
                date_of_birth: student.date_of_birth,
                roll_no: student.roll_no,
                image_url: student.image_url,
                resume_url: student.resume_url
            }
        });
    } catch (error) {
        next(error);
    }
}

export const getStudentByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const actor = req.user as UserJwtPayload;
        const { user_id } = req.params as StudentIdParamInput;
        const student = await getStudentByIdService(Number(user_id), actor);
        res.status(200).json({
            success: true,
            message: "Successfully fetched student profile",
            data: {
                email: student.user_table.email,
                mobile_no: student.user_table.mobile_no,
                name: student.user_table.name,
                category: student.category_table?.category,
                department: student.department_table?.department_name,
                gender: student.gender_table?.gender,
                cgpa: student.cgpa,
                semester: student.semester_table?.semester,
                skill: student.student_skill_table.map((skill) => skill.skill_table.skill),
                tenth_division: student.division_table_student_table_tenth_division_idTodivision_table?.division,
                twelfth_division: student.division_table_student_table_twelfth_division_idTodivision_table?.division,
                date_of_birth: student.date_of_birth,
                roll_no: student.roll_no,
                image_url: student.image_url,
                resume_url: student.resume_url
            }
        });
    } catch (error) {
        next(error);
    }
}