
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
            const eligibleTraining = await Training.findEligibleById(actor.auth_user_id);
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
    switch (actor.auth_role_id) {
        case Role.Student:
            const eligibleTraining = await Training.findOneEligibleById(trainind_id, actor.auth_user_id);
            if (!eligibleTraining) {
                throw new ApiError(500, "Could not find eligible training");
            }
            return eligibleTraining;
        case Role.Organization:
        case Role.Coordinator:
        case Role.SuperAdmin:
            const creatorTraining = await Training.findById(trainind_id);
            if (!creatorTraining) {
                throw new ApiError(500, "Could not find training");
            }
            return creatorTraining;
        default:
            throw new ApiError(404, "Invalid Role");
    }
}

export const checkStudentTrainingEligibilitySerivce = async (training_id: number, actor: UserJwtPayload): Promise<TrainingEligibilityResult> => {
    const training = await Training.findById(training_id);
    if (!training) {
        throw new ApiError(404, "Training does not exist");
    }
    if (!training.is_active) {
        return {
            isEligible: false,
            reason: "Training is not active"
        };
    }
    
    const student = await Student.findById(actor.auth_user_id);
    if (!student) {
        throw new ApiError(404, "Student does not exist");
    }


    if (training.min_cgpa !== null) {
        if (student.cgpa === null) {
            return {
                isEligible: false,
                reason: "Training requires minimum cgpa, but student has not set their cgpa"
            };
        }
    }

    return {
        isEligible: true,
        reason: "Student is Eligible"
    }
}
