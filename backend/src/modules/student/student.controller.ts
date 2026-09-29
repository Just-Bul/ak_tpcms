import type { Request, Response, NextFunction } from "express";
import { 
    registerStudentService, 
    updateStudentAdminService, 
    updateStudentService, 
    getStudentByIdService, 
    getStudentService,
    addStudentDocumentService,
    getStudentDocumentsService,
    deleteStudentDocumentService,
    verifyStudentDocumentService
} from "./student.service.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import Student from "./student.model.js";
import type { 
    StudentDocumentCreateInput, 
    StudentDocumentVerifyInput, 
    StudentFilterQuery, 
    StudentIdParamInput, 
    StudentRegisterInput, 
    StudentUpdateAdminInput, 
    StudentUpdateInput 
} from "./student.type.js";
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
        const filter = req.query as unknown as StudentFilterQuery;
        const studentList = await getStudentService(req.user as UserJwtPayload, filter);
        const sanitizedList = studentList.map((student: any) => {
            const sanitized = Data.sanitize(student);
            sanitized.student_status = student.student_status ?? (student.is_graduate ? "ALUMNI" : "ACTIVE");
            sanitized.graduation = Boolean(student.graduation ?? student.is_graduate);
            sanitized.is_graduate = Boolean(student.is_graduate);
            sanitized.has_backlog = Boolean(student.has_backlog);
            sanitized.graduation_year = student.graduation_year ?? student.alumni_table?.passing_year ?? null;
            sanitized.grade_card_url = student.grade_card_url ?? null;
            sanitized.alumni_details = student.alumni_table ?? null;
            sanitized.documents = student.student_document_table ?? [];
            return sanitized;
        });
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
        const student: any = await getStudentByIdService(actor.auth_user_id, actor);
        const studentStatus = student.student_status ?? (student.is_graduate ? "ALUMNI" : "ACTIVE");
        res.status(200).json({
            success: true,
            message: "Successfully fetched profile",
            data: {
                user_id: student.user_id,
                name: student.user_table.name,
                mobile_no: student.user_table.mobile_no,
                email: student.user_table.email,
                department: student.department_table?.department_name,
                department_id: student.department_id,
                category: student.category_table?.category,
                category_id: student.category_id,
                gender: student.gender_table?.gender,
                gender_id: student.gender_id,
                cgpa: student.cgpa,
                semester: student.semester_table?.semester,
                semester_id: student.semester_id,
                skill: student.student_skill_table?.map((skill: any) => skill.skill_table?.skill) ?? [],
                tenth_division: student.division_table_student_table_tenth_division_idTodivision_table?.division,
                twelfth_division: student.division_table_student_table_twelfth_division_idTodivision_table?.division,
                date_of_birth: student.date_of_birth,
                roll_no: student.roll_no,
                image_url: student.image_url,
                resume_url: student.resume_url,
                grade_card_url: student.grade_card_url,
                has_backlog: Boolean(student.has_backlog),
                graduation_year: student.graduation_year ?? student.alumni_table?.passing_year ?? null,
                graduation: Boolean(student.graduation ?? student.is_graduate),
                is_graduate: Boolean(student.is_graduate),
                student_status: studentStatus,
                alumni_details: student.alumni_table ?? null,
                documents: student.student_document_table ?? []
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
        const student: any = await getStudentByIdService(Number(user_id), actor);
        const studentStatus = student.student_status ?? (student.is_graduate ? "ALUMNI" : "ACTIVE");
        res.status(200).json({
            success: true,
            message: "Successfully fetched student profile",
            data: {
                user_id: student.user_id,
                email: student.user_table.email,
                mobile_no: student.user_table.mobile_no,
                name: student.user_table.name,
                category: student.category_table?.category,
                category_id: student.category_id,
                department: student.department_table?.department_name,
                department_id: student.department_id,
                gender: student.gender_table?.gender,
                gender_id: student.gender_id,
                cgpa: student.cgpa,
                semester: student.semester_table?.semester,
                semester_id: student.semester_id,
                skill: student.student_skill_table?.map((skill: any) => skill.skill_table?.skill) ?? [],
                tenth_division: student.division_table_student_table_tenth_division_idTodivision_table?.division,
                twelfth_division: student.division_table_student_table_twelfth_division_idTodivision_table?.division,
                date_of_birth: student.date_of_birth,
                roll_no: student.roll_no,
                image_url: student.image_url,
                resume_url: student.resume_url,
                grade_card_url: student.grade_card_url,
                has_backlog: Boolean(student.has_backlog),
                graduation_year: student.graduation_year ?? student.alumni_table?.passing_year ?? null,
                graduation: Boolean(student.graduation ?? student.is_graduate),
                is_graduate: Boolean(student.is_graduate),
                student_status: studentStatus,
                alumni_details: student.alumni_table ?? null,
                documents: student.student_document_table ?? []
            }
        });
    } catch (error) {
        next(error);
    }
}


export const addStudentDocumentController = async (
    req: Request<{}, {}, StudentDocumentCreateInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const actor = req.user as UserJwtPayload;
        const doc = await addStudentDocumentService(actor, req.body);
        res.status(201).json({
            success: true,
            message: "Document uploaded and saved successfully",
            data: doc
        });
    } catch (error) {
        next(error);
    }
}

export const getStudentDocumentsMeController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const actor = req.user as UserJwtPayload;
        const docs = await getStudentDocumentsService(actor.auth_user_id, actor);
        res.status(200).json({
            success: true,
            message: "Documents fetched successfully",
            data: docs
        });
    } catch (error) {
        next(error);
    }
}

export const getStudentDocumentsByUserIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const actor = req.user as UserJwtPayload;
        const userId = Number(req.params.user_id);
        const docs = await getStudentDocumentsService(userId, actor);
        res.status(200).json({
            success: true,
            message: "Documents fetched successfully",
            data: docs
        });
    } catch (error) {
        next(error);
    }
}

export const deleteStudentDocumentController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const actor = req.user as UserJwtPayload;
        const docId = Number(req.params.document_id);
        const result = await deleteStudentDocumentService(docId, actor);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export const verifyStudentDocumentController = async (
    req: Request<{ document_id: string }, {}, StudentDocumentVerifyInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const actor = req.user as UserJwtPayload;
        const docId = Number(req.params.document_id);
        const verified = req.body.verified !== undefined ? Boolean(req.body.verified) : true;
        const updatedDoc = await verifyStudentDocumentService(docId, verified, actor);
        res.status(200).json({
            success: true,
            message: `Document ${verified ? "verified" : "unverified"} successfully`,
            data: updatedDoc
        });
    } catch (error) {
        next(error);
    }
}