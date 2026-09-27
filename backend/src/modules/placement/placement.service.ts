
import Student from "../student/student.model.js";

import Organization from "../organization/organization.model.js";
import ApiError from "../../utils/ApiError.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import type { IPlacement, PlacementCreateData, PlacementCreateInput, PlacementEligibilityResult } from "./placement.type.js";
import User from "../user/user.model.js";
import Placement from "./placement.model.js";
import Role from "../role/role.model.js";

export const createPlacementService = async (input: PlacementCreateInput, actor: UserJwtPayload): Promise<IPlacement> => {
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

    const placementData: PlacementCreateData = {
        creator_id: actor.auth_user_id,
        title: input.title,
        description: input.description ?? null,
        min_cgpa: input.min_cgpa ?? null,
        image_url: input.image_url ?? null,
        last_date_of_submission: input.last_date_of_submission ?? null,
        is_active: input.is_active ?? null,
        min_tenth_division_id: input.min_tenth_division_id ?? null,
        min_twelfth_division_id: input.min_twelfth_division_id ?? null,
        has_backlog: input.has_backlog ?? null,
        salary_lower: input.salary_lower ?? null,
        salary_upper: input.salary_upper ?? null,
        only_category: input.only_category ?? [],
        only_department: input.only_department ?? [],
        only_semester: input.only_semester ?? [],
    }

    if (input.end_date !== undefined) {
        placementData.end_date = input.end_date
    }
    if (input.start_date !== undefined) {
        placementData.start_date = input.start_date;
    }

    const placement = await Placement.create(placementData);
    if (!placement) {
        throw new ApiError(500, "Failed to create placement");
    }
    return placement;
}

export const getPlacementService = async (actor: UserJwtPayload): Promise<IPlacement[]> => {
    switch (actor.auth_role_id) {
        case Role.Student:
            const eligiblePlacement = await Placement.findAll();
            if (!eligiblePlacement) {
                throw new ApiError(500, "Could not find eligible placements");
            }
            return eligiblePlacement;
        case Role.Organization:
        case Role.Coordinator:
        case Role.SuperAdmin:
            const creatorPlacement = await Placement.findByCreatorId(actor.auth_user_id);
            if (!creatorPlacement) {
                throw new ApiError(500, "Could not find placements");
            }
            return creatorPlacement;
        default:
            throw new ApiError(404, "Invalid Role");
    }
}

export const getOnePlacementService = async (placement_id: number, actor: UserJwtPayload): Promise<IPlacement> => {
    switch (actor.auth_role_id) {
        case Role.Student:
            const eligiblePlacement = await Placement.findOneEligibleById(placement_id, actor.auth_user_id);
            if (!eligiblePlacement) {
                throw new ApiError(500, "Could not find eligible placement");
            }
            return eligiblePlacement;
        case Role.Organization:
        case Role.Coordinator:
        case Role.SuperAdmin:
            const creatorPlacement = await Placement.findById(placement_id);
            if (!creatorPlacement) {
                throw new ApiError(500, "Could not find placement");
            }
            return creatorPlacement;
        default:
            throw new ApiError(404, "Invalid Role");
    }
}

export const checkStudentPlacementEligibilityService = async (placement_id: number, actor: UserJwtPayload): Promise<PlacementEligibilityResult> => {
    const placement: any = await Placement.findById(placement_id);
    if (!placement) {
        throw new ApiError(404, "Placement does not exist");
    }
    if (!placement.is_active) {
        return {
            isEligible: false,
            reason: "Placement is not active"
        };
    }

    if (placement.last_date_of_submission) {
        const now = new Date();
        const deadline = new Date(placement.last_date_of_submission);
        deadline.setHours(23, 59, 59, 999);
        if (now > deadline) {
            return {
                isEligible: false,
                reason: "Application deadline for this placement has passed"
            };
        }
    }
    
    const student = await Student.findById(actor.auth_user_id);
    if (!student) {
        throw new ApiError(404, "Student does not exist");
    }

    // Minimum CGPA Check
    if (placement.min_cgpa !== null) {
        if (student.cgpa === null) {
            return {
                isEligible: false,
                reason: `Placement requires minimum CGPA of ${placement.min_cgpa}, but your CGPA is not set`
            };
        }
        const studentCgpa = Number(student.cgpa);
        const minCgpa = Number(placement.min_cgpa);
        if (studentCgpa < minCgpa) {
            return {
                isEligible: false,
                reason: `CGPA requirement not met (Minimum: ${minCgpa}, Your CGPA: ${studentCgpa})`
            };
        }
    }

    // Backlog Check
    if (placement.has_backlog === false && student.has_backlog === true) {
        return {
            isEligible: false,
            reason: "This placement does not allow active backlogs"
        };
    }

    // 10th Division Check
    if (placement.min_tenth_division_id !== null) {
        if (!student.tenth_division_id) {
            return {
                isEligible: false,
                reason: "10th standard division not specified in student profile"
            };
        }
        if (student.tenth_division_id > placement.min_tenth_division_id) {
            return {
                isEligible: false,
                reason: "10th standard division requirement not met"
            };
        }
    }

    // 12th Division Check
    if (placement.min_twelfth_division_id !== null) {
        if (!student.twelfth_division_id) {
            return {
                isEligible: false,
                reason: "12th standard division not specified in student profile"
            };
        }
        if (student.twelfth_division_id > placement.min_twelfth_division_id) {
            return {
                isEligible: false,
                reason: "12th standard division requirement not met"
            };
        }
    }

    // Department / Branch Filter
    const allowedDepts = placement.placement_department_table || [];
    if (allowedDepts.length > 0) {
        const deptIds = allowedDepts.map((d: any) => d.department_id);
        if (!student.department_id || !deptIds.includes(student.department_id)) {
            return {
                isEligible: false,
                reason: "Your department/branch is not eligible for this placement drive"
            };
        }
    }

    // Category Filter
    const allowedCategories = placement.placement_category_table || [];
    if (allowedCategories.length > 0) {
        const catIds = allowedCategories.map((c: any) => c.category_id);
        if (!student.category_id || !catIds.includes(student.category_id)) {
            return {
                isEligible: false,
                reason: "Your category is not eligible for this placement drive"
            };
        }
    }

    // Semester Filter
    const allowedSemesters = placement.placement_semester_table || [];
    if (allowedSemesters.length > 0) {
        const semIds = allowedSemesters.map((s: any) => s.semester_id);
        if (!student.semester_id || !semIds.includes(student.semester_id)) {
            return {
                isEligible: false,
                reason: "Your current semester is not eligible for this placement drive"
            };
        }
    }

    return {
        isEligible: true,
        reason: "Student is Eligible"
    };
};
