import type { Prisma } from "@prisma/client";
import Student from "./student.model.js";
import type { 
    IStudent, 
    StudentCreateData, 
    StudentDocumentCreateInput, 
    StudentFilterQuery, 
    StudentRegisterInput, 
    StudentUpdateAdminInput, 
    StudentUpdateData, 
    StudentUpdateInput 
} from "./student.type.js";
import ApiError from "../../utils/ApiError.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import PasswordManager from "../../utils/password.util.js";
import Data from "../../utils/data.util.js";
import User from "../user/user.model.js";
import Role from "../role/role.model.js";
import Department from "../department/department.model.js";

export const registerStudentService = async (input: StudentRegisterInput, actor: UserJwtPayload): Promise<IStudent> => {
    const existingUser = await User.findByEmail(input.email);
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    input.password = await PasswordManager.hashPassword(input.password);
    const newStudent = await Student.create(input);

    if (!newStudent) {
        throw new ApiError(500, "Failed to create new student");
    }
    return newStudent;
}

export const updateStudentService = async (input: StudentUpdateInput, actor: UserJwtPayload) => {
    const existingStudent = await Student.findByEmail(actor.auth_email);
    if (!existingStudent) {
        throw new ApiError(404, "Student not found");
    }
    const studentData: StudentUpdateData = Data.filterUndefined({
        email: input.email,
        mobile_no: input.mobile_no,
        name: input.name,
        has_backlog: input.has_backlog,
        cgpa: input.cgpa,
        tenth_division_id: input.tenth_division_id,
        twelfth_division_id: input.twelfth_division_id,
        category_id: input.category_id,
        department_id: input.department_id ?? input.deprtment_id,
        semester_id: input.semester_id,
        resume_url: input.resume_url,
        image_url: input.image_url,
        gender_id: input.gender_id,
        date_of_birth: input.date_of_birth,
        is_graduate: input.is_graduate,
        graduation: input.graduation,
        graduation_year: input.graduation_year ?? input.passing_year,
        grade_card_url: input.grade_card_url,
        status: input.status,
        passing_year: input.passing_year ?? input.graduation_year,
        current_company: input.current_company,
        designation: input.designation
    });
    const updatedStudent = await Student.update(actor.auth_user_id, studentData, input.skills);
    if (!updatedStudent) {
        throw new ApiError(500, "Failed to update student");
    }
    const theStudent = await Student.findById(updatedStudent.user_id);
    if (!theStudent) {
        throw new ApiError(500, "Failed to update student");
    }
    return theStudent;
}

export const updateStudentAdminService = async (student_id: number, input: StudentUpdateAdminInput, actor: UserJwtPayload) => {
    const existingStudent = await Student.findById(student_id);
    if (!existingStudent) {
        throw new ApiError(404, "Student not found");
    }

    const updatedStudent = await Student.updateAdmin(student_id, Data.filterUndefined(input));
    if (!updatedStudent) {
        throw new ApiError(500, "Failed to update student");
    }
    const theStudent = await Student.findById(updatedStudent.user_id);
    if (!theStudent) {
        throw new ApiError(500, "Failed to update student");
    }
    return theStudent;
}

export const getStudentByIdService = async (user_id: number, actor: UserJwtPayload) => {
    const student = await Student.findById(user_id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const isSelf = actor.auth_user_id === user_id;
    const isSuperAdmin = actor.auth_role_id === Role.SuperAdmin;

    const studentDepartment = await Department.findById(student.department_id ?? 1);
    const isCoordinatorOfDepartment = actor.auth_role_id === Role.Coordinator && studentDepartment?.coordinator_id === actor.auth_user_id;

    if (!isSelf && !isSuperAdmin && !isCoordinatorOfDepartment) {
        throw new ApiError(403, "You do not have permission to access this student's profile");
    }

    return student;
}

export const getStudentService = async (actor: UserJwtPayload, filter?: StudentFilterQuery) => {
    let studentList = null;
    switch (actor.auth_role_id) {
        case Role.SuperAdmin: {
            studentList = await Student.findAll(filter);
            break;
        }
        case Role.Coordinator: {
            studentList = await Student.findByCoordinatorId(actor.auth_user_id, filter);
            break;
        }
    }
    if (!studentList) {
        throw new ApiError(404, "Couldn't fetch student list");
    }
    return studentList;
}

// ==========================================
// Student Document Repository Services
// ==========================================

export const addStudentDocumentService = async (
    actor: UserJwtPayload,
    docData: StudentDocumentCreateInput
) => {
    // If student, they can only upload for themselves
    let targetUserId = actor.auth_user_id;
    if (actor.auth_role_id === Role.SuperAdmin || actor.auth_role_id === Role.Coordinator) {
        if (docData.user_id) {
            targetUserId = docData.user_id;
        }
    }

    const student = await Student.findById(targetUserId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const doc = await Student.createDocument({
        user_id: targetUserId,
        document_type: docData.document_type,
        document_name: docData.document_name,
        document_url: docData.document_url
    });

    return doc;
}

export const getStudentDocumentsService = async (
    user_id: number,
    actor: UserJwtPayload
) => {
    const isSelf = actor.auth_user_id === user_id;
    const isTandPCell = actor.auth_role_id === Role.SuperAdmin || actor.auth_role_id === Role.Coordinator;

    if (!isSelf && !isTandPCell) {
        throw new ApiError(403, "Not authorized to view these documents");
    }

    return await Student.findDocumentsByUserId(user_id);
}

export const deleteStudentDocumentService = async (
    document_id: number,
    actor: UserJwtPayload
) => {
    const doc = await Student.findDocumentById(document_id);
    if (!doc) {
        throw new ApiError(404, "Document not found");
    }

    const isOwner = actor.auth_user_id === doc.user_id;
    const isSuperAdmin = actor.auth_role_id === Role.SuperAdmin;

    if (!isOwner && !isSuperAdmin) {
        throw new ApiError(403, "Not authorized to delete this document");
    }

    const success = await Student.deleteDocument(document_id);
    if (!success) {
        throw new ApiError(500, "Failed to delete document");
    }
    return { success: true, message: "Document deleted successfully" };
}

export const verifyStudentDocumentService = async (
    document_id: number,
    verified: boolean,
    actor: UserJwtPayload
) => {
    // Only T&P Cell can verify documents
    if (actor.auth_role_id !== Role.SuperAdmin && actor.auth_role_id !== Role.Coordinator) {
        throw new ApiError(403, "Only T&P Cell (Coordinator or SuperAdmin) can verify student documents");
    }

    const doc = await Student.findDocumentById(document_id);
    if (!doc) {
        throw new ApiError(404, "Document not found");
    }

    return await Student.verifyDocument(document_id, verified);
}