
import Student from "../student/student.model.js";
import Training from "./training.model.js";
import Organization from "../organization/organization.model.js";
import ApiError from "../../utils/ApiError.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import type { ITraining, TrainingCreateData, TrainingCreateInput, TrainingEligibilityResult } from "./training.type.js";
import User from "../user/user.model.js";
import Role from "../role/role.model.js";

export const createTrainingService = async (input: TrainingCreateInput, actor: UserJwtPayload): Promise<ITraining> => {
    const creator = await User.findByEmail(actor.auth_email);
    if (!creator) {
        throw new ApiError(404, "User does not exist");
    }
    if (actor.auth_role_id === Role.Organization) {
        const org = await Organization.findById(actor.auth_user_id);
        if (!org || org.approval_id !== 2) {
            throw new ApiError(403, "Organization account is not approved or has been rejected");
        }
    }

    const trainingData: TrainingCreateData = {
        creator_id: actor.auth_user_id,
        title: input.title,
        description: input.description ?? null,
        min_cgpa: input.min_cgpa ?? null,
        end_date: input.end_date ?? null,
        start_date: input.start_date ?? null,
        image_url: input.image_url ?? null,
        last_date_of_submission: input.last_date_of_submission ?? null,
        is_active: input.is_active ?? null,
        only_semester: input.only_semester,
        only_department: input.only_department
    }
    const training = await Training.create(trainingData);
    if (!training) {
        throw new ApiError(500, "Failed to create training");
    }
    return training;
}

export const getTrainingService = async (actor: UserJwtPayload): Promise<ITraining[]> => {
    switch (actor.auth_role_id) {
        case Role.Student:
            const eligibleTraining = await Training.findAll();
            if (!eligibleTraining) {
                throw new ApiError(500, "Could not find eligible trainings");
            }
            return eligibleTraining;
        case Role.Organization:
        case Role.Coordinator:
        case Role.SuperAdmin:
            const creatorTraining = await Training.findByCreatorId(actor.auth_user_id);
            if (!creatorTraining) {
                throw new ApiError(500, "Could not find trainings");
            }
            return creatorTraining;
        default:
            throw new ApiError(404, "Invalid Role");
    }
}

export const disableOneTrainingService = async (training_id: number, actor: UserJwtPayload) => {
    const training = await Training.findById(training_id);
    if (!training) {
        throw new ApiError(500, "Could not find trainings");
    }
    if (training?.creator_id !== actor.auth_user_id) {
        throw new ApiError(400, "You are not authorized to delete the trainig")
    }

    const disabledTraining = await Training.disable(training_id);
    if (!disabledTraining) {
        throw new ApiError(500, "Could not disable training");
    }

    return disabledTraining;
}

export const getOneTrainingService = async (trainind_id: number, actor: UserJwtPayload): Promise<ITraining> => {
    const training = await Training.findById(trainind_id);
    if (!training) {
        throw new ApiError(404, "Could not find training");
    }
    return training;
}

export const checkStudentTrainingEligibilitySerivce = async (training_id: number, actor: UserJwtPayload): Promise<TrainingEligibilityResult> => {
    const training: any = await Training.findById(training_id);
    if (!training) {
        throw new ApiError(404, "Training does not exist");
    }
    if (!training.is_active) {
        return {
            isEligible: false,
            reason: "Training is not active"
        };
    }

    if (training.last_date_of_submission) {
        const now = new Date();
        const deadline = new Date(training.last_date_of_submission);
        deadline.setHours(23, 59, 59, 999);
        if (now > deadline) {
            return {
                isEligible: false,
                reason: "Application deadline for this training has passed"
            };
        }
    }
    
    const student = await Student.findById(actor.auth_user_id);
    if (!student) {
        throw new ApiError(404, "Student does not exist");
    }

    // Minimum CGPA Check
    if (training.min_cgpa !== null) {
        if (student.cgpa === null) {
            return {
                isEligible: false,
                reason: `Training requires minimum CGPA of ${training.min_cgpa}, but your CGPA is not set`
            };
        }
        const studentCgpa = Number(student.cgpa);
        const minCgpa = Number(training.min_cgpa);
        if (studentCgpa < minCgpa) {
            return {
                isEligible: false,
                reason: `CGPA requirement not met (Minimum: ${minCgpa}, Your CGPA: ${studentCgpa})`
            };
        }
    }

    // Department / Branch Filter
    const allowedDepts = training.training_department_table || [];
    if (allowedDepts.length > 0) {
        const deptIds = allowedDepts.map((d: any) => d.department_id);
        if (!student.department_id || !deptIds.includes(student.department_id)) {
            return {
                isEligible: false,
                reason: "Your department/branch is not eligible for this training program"
            };
        }
    }

    // Semester Filter
    const allowedSemesters = training.training_semester_table || [];
    if (allowedSemesters.length > 0) {
        const semIds = allowedSemesters.map((s: any) => s.semester_id);
        if (!student.semester_id || !semIds.includes(student.semester_id)) {
            return {
                isEligible: false,
                reason: "Your current semester is not eligible for this training program"
            };
        }
    }

    return {
        isEligible: true,
        reason: "Student is Eligible"
    };
};
