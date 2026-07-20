
import Student from "../student/student.model.js";

import type { IPlacementApplication, PlacementApplicationCreateData, PlacementApplicationCreateInput } from "./placement_application.type.js";
import ApiError from "../../utils/ApiError.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import { checkStudentPlacementEligibilityService } from "../placement/placement.service.js";
import PlacementApplication from "./placement_application.model.js";
import User from "../user/user.model.js";
import Role from "../role/role.model.js";
import Placement from "../placement/placement.model.js";

export const createPlacementApplicationService = async (input: PlacementApplicationCreateInput, student: UserJwtPayload): Promise<IPlacementApplication> =>  {
    const existingPlacementApplication = await PlacementApplication.findById(student.auth_user_id, input.placement_id);
    if (existingPlacementApplication) {
        throw new ApiError(409, "An application from this user already exists");
    }
    const placementApplicationData: PlacementApplicationCreateData = {
        student_id: student.auth_user_id,
        placement_id: input.placement_id
    }

    const eligibilty = await checkStudentPlacementEligibilityService(placementApplicationData.placement_id, student);
    if (eligibilty.isEligible === false) {
        throw new ApiError(400, eligibilty.reason);
    }

    const newPlacementApplication = await PlacementApplication.create(placementApplicationData);
    if (!newPlacementApplication) {
        throw new ApiError(500, "Failed to create application");
    }

    return newPlacementApplication;
}

export const viewPlacementApplicationService = async (user: UserJwtPayload): Promise<IPlacementApplication[]> => {
    const currentUser = await User.findByEmail(user.auth_email);
    if (!currentUser) {
        throw new ApiError(404, "User with this email does not exist");
    }

    let placementApplication: IPlacementApplication[] | null = null;
    switch (user.auth_role_id) {
        case Role.Student:
            placementApplication = await PlacementApplication.findByStudentId(user.auth_user_id);
            break;
        case Role.Organization:
        case Role.Coordinator:
        case Role.SuperAdmin:
            placementApplication = await PlacementApplication.findByCreatorId(user.auth_user_id);
            break;
    }

    if (!placementApplication) {
        throw new ApiError(500, `Could not fetch Placement Application Data`);
    }

    return placementApplication;
}  

export const approvePlacementApplicationService = async (student_id: number, placement_id: number, user: UserJwtPayload): Promise<IPlacementApplication> => {
    const student = await Student.findById(student_id);
    if (!student) {
        throw new ApiError(404, "Student does not exist");
    }

    const placementApplication = await PlacementApplication.findById(student_id, placement_id);
    if (!placementApplication) {
        throw new ApiError(404, "Placement application does not exist");
    }

    const placement = await Placement.findById(placementApplication.placement_id);
    if (!placement) {
        throw new ApiError(404, "Placement with this ID does not exist");
    }

    const isCreator = placement.creator_id === user.auth_user_id;
    const isAdminOrCoordinator = user.auth_role_id === Role.SuperAdmin || user.auth_role_id === Role.Coordinator;

    if (!isCreator && !isAdminOrCoordinator) {
        throw new ApiError(403, "You do not have permission to approve applications for this placement");
    }

    const approvedPlacement = await PlacementApplication.approve(student_id, placement_id);
    if (!approvedPlacement) {
        throw new ApiError(500, `Could not approve Placement Application`);
    }

    return approvedPlacement;
}  

export const rejectPlacementApplicationService = async (student_id: number, placement_id: number, user: UserJwtPayload): Promise<IPlacementApplication> => {
    const student = await Student.findById(student_id);
    if (!student) {
        throw new ApiError(404, "Student does not exist");
    }

    const placementApplication = await PlacementApplication.findById(student_id, placement_id);
    if (!placementApplication) {
        throw new ApiError(404, "Placement application does not exist");
    }

    const placement = await Placement.findById(placementApplication.placement_id);
    if (!placement) {
        throw new ApiError(404, "Placement with this ID does not exist");
    }

    const isCreator = placement.creator_id === user.auth_user_id;
    const isAdminOrCoordinator = user.auth_role_id === Role.SuperAdmin || user.auth_role_id === Role.Coordinator;

    if (!isCreator && !isAdminOrCoordinator) {
        throw new ApiError(403, "You do not have permission to reject applications for this placement");
    }

    const rejectedPlacement = await PlacementApplication.reject(student_id, placement_id);
    if (!rejectedPlacement) {
        throw new ApiError(500, `Could not reject Placement Application`);
    }

    return rejectedPlacement;
}

export const getOnePlacementApplicationService = async (student_id: number, placement_id: number, actor: UserJwtPayload) => {
    const placement = await Placement.findById(placement_id);
    if (!placement) {
        throw new ApiError(404, "Requested placment not found for this application");
    }

    const student = await Student.findById(student_id);
    if (!student) {
        throw new ApiError(404, "This student does not exist");
    }

    const placmenetApplication = await PlacementApplication.findById(student_id, placement_id);
    if (!placmenetApplication) {
        throw new ApiError(404, "Placement application not found");
    }

    switch (actor.auth_role_id) {
        case Role.Student:
            if (actor.auth_user_id != student_id) {
                throw new ApiError(400, "You are not authorized to view this placmenet application");
            }
            return placmenetApplication;
        case Role.Organization:
        case Role.Coordinator:
            if (actor.auth_user_id != placement.creator_id) {
                throw new ApiError(400, "You are not authroized to view this placement application");
            }
            return placmenetApplication;
        case Role.SuperAdmin:
            return placmenetApplication;
        default:
            throw new ApiError(404, "User role is undefined");
    }
}