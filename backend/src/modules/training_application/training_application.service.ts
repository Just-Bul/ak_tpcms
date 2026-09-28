import Student from "../student/student.model.js";
import Training from "../training/training.model.js";
import TrainingApplication from "./training_application.model.js";
import ApiError from "../../utils/ApiError.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import { checkStudentTrainingEligibilitySerivce } from "../training/training.service.js";
import User from "../user/user.model.js";
import Role from "../role/role.model.js";
import type { ITrainingApplication, TrainingApplicationCreateData, TrainingApplicationCreateInput } from "./training_application.type.js";

export const createTrainingApplicationService = async (input: TrainingApplicationCreateInput, student: UserJwtPayload): Promise<ITrainingApplication> =>  {
    const existingTrainingApplication = await TrainingApplication.findById(student.auth_user_id, input.training_id);
    if (existingTrainingApplication) {
        throw new ApiError(409, "An application from this user already exists");
    }
    const trainingApplicationData: TrainingApplicationCreateData = {
        student_id: student.auth_user_id,
        training_id: input.training_id
    }

    const eligibilty = await checkStudentTrainingEligibilitySerivce(trainingApplicationData.training_id, student);
    if (eligibilty.isEligible === false) {
        throw new ApiError(400, eligibilty.reason);
    }

    const newTrainingApplication = await TrainingApplication.create({student_id: student.auth_user_id, training_id: input.training_id});
    if (!newTrainingApplication) {
        throw new ApiError(500, "Failed to create application");
    }

    return newTrainingApplication;
}

export const viewTrainingApplicationService = async (user: UserJwtPayload): Promise<ITrainingApplication[]> => {
    const currentUser = await User.findByEmail(user.auth_email);
    if (!currentUser) {
        throw new ApiError(404, "User with this email does not exist");
    }

    let trainingApplication: ITrainingApplication[] | null = null;
    switch (user.auth_role_id) {
        case Role.Student:
            trainingApplication = await TrainingApplication.findByStudentId(user.auth_user_id);
            break;
        case Role.Organization:
        case Role.Coordinator:
        case Role.SuperAdmin:
            trainingApplication = await TrainingApplication.findByCreatorId(user.auth_user_id);
            break;
    }

    if (!trainingApplication) {
        throw new ApiError(500, `Could not fetch Training Application Data`);
    }

    return trainingApplication;
}  

export const updateTrainingApplicationStatusService = async (data: {
    student_id: number, 
    training_id: number, 
    remarks?: string | undefined,
    status: "approve" | "reject"
}, user: UserJwtPayload) => {
    const student = await Student.findById(data.student_id);
    if (!student) {
        throw new ApiError(404, "Student does not exist");
    }

    const trainingApplication = await TrainingApplication.findById(data.student_id, data.training_id);
    if (!trainingApplication) {
        throw new ApiError(404, "Training application does not exist");
    }

    const training = await Training.findById(trainingApplication.training_id);
    if (!training) {
        throw new ApiError(404, "Training with this ID does not exist");
    }

    const isCreator = training.creator_id === user.auth_user_id;
    const isAdminOrCoordinator = user.auth_role_id === Role.SuperAdmin || user.auth_role_id === Role.Coordinator;

    if (!isCreator && !isAdminOrCoordinator) {
        throw new ApiError(403, `You do not have permission to ${data.status} applications for this training`);
    }

    const approvedTraining = await TrainingApplication.updateState(data);
    if (!approvedTraining) {
        throw new ApiError(500, `Could not ${data.status} Training Application`);
    }

    return approvedTraining;
}  

export const getOneTrainingApplicationService = async (student_id: number, training_id: number, actor: UserJwtPayload) => {
    const training = await Training.findById(training_id);
    if (!training) {
        throw new ApiError(404, "Requested training not found for this application");
    }

    const student = await Student.findById(student_id);
    if (!student) {
        throw new ApiError(404, "This student does not exist");
    }

    const trainingApplication = await TrainingApplication.findById(student_id, training_id);
    if (!trainingApplication) {
        throw new ApiError(404, "Training application not found");
    }

    switch (actor.auth_role_id) {
        case Role.Student:
            if (actor.auth_user_id != student_id) {
                throw new ApiError(400, "You are not authorized to view this training application");
            }
            return trainingApplication;
        case Role.Organization:
        case Role.Coordinator:
            if (actor.auth_user_id != training.creator_id) {
                throw new ApiError(400, "You are not authroized to view this training application");
            }
            return trainingApplication;
        case Role.SuperAdmin:
            return trainingApplication;
        default:
            throw new ApiError(404, "User role is undefined");
    }
}