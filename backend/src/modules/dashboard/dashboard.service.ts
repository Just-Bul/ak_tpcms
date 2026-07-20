
import Student from "../student/student.model.js";
import Training from "../training/training.model.js";
import TrainingApplication from "../training_application/training_application.model.js";
import type { AdminDashboardOutput, DepartmentDashboardOutput, StudentDashboardOutput } from "./dashboard.type.js";
import ApiError from "../../utils/ApiError.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import PlacementApplication from "../placement_application/placement_application.model.js";
import Placement from "../placement/placement.model.js";
import Role from "../role/role.model.js";
import Department from "../department/department.model.js";
import Organization from "../organization/organization.model.js";

export const dashboardService = async (actor: UserJwtPayload): Promise<AdminDashboardOutput | StudentDashboardOutput | DepartmentDashboardOutput>  => {
    switch (actor.auth_role_id) {
        case Role.Student: {
            const trainingApplicationList = await TrainingApplication.findByStudentId(actor.auth_user_id);
            const eligibleTrainingList = await Training.findEligibleById(actor.auth_user_id);
            const placementApplicationList = await PlacementApplication.findByStudentId(actor.auth_user_id);
            const eligiblePlacementList = await Placement.findEligibleById(actor.auth_user_id);
            const dashboardData: StudentDashboardOutput = {
                appliedTrainings: trainingApplicationList ?? [],
                eligibleTrainings: eligibleTrainingList ?? [],
                appliedPlacement: placementApplicationList ?? [],
                eligiblePlacement: eligiblePlacementList ?? []
            };
            return dashboardData;
        }
        case Role.SuperAdmin: {
            const totalStudentCount = await Student.findCount();
            const totalDepartmentCount = await Department.findCount();
            const totalOrganizationCount = await Organization.findCount();
            const totalTrainingCount = await Training.findCount();
            const trainingApplicationCount = await TrainingApplication.findCount();
            const approvedTrainingApplicationCount = await TrainingApplication.findCountByFilter({ status_id: 1 });

            const totalPlacementCount = await Placement.findCount();
            const placementApplicationCount = await PlacementApplication.findCount();
            const approvedPlacementApplicationCount = await PlacementApplication.findCountByFilter({ status_id: 1 });

            return {
                studentCount: totalStudentCount ?? 0,
                departmentCount: totalDepartmentCount ?? 0,
                organizationCount: totalOrganizationCount ?? 0,
                trainingCount: totalTrainingCount ?? 0,
                trainingPercentage: (trainingApplicationCount && trainingApplicationCount > 0) ? ((approvedTrainingApplicationCount ?? 0) / trainingApplicationCount) * 100 : 0,
                placementCount: totalPlacementCount ?? 0,
                placementPercentage: (placementApplicationCount && placementApplicationCount > 0) ? ((approvedPlacementApplicationCount ?? 0) / placementApplicationCount) * 100 : 0
            };
        }
        case Role.Coordinator: {
            const department_id = actor.auth_user_id;

            const studentInDepartmentCount = await Student.findCountByDepartmentId(department_id);
            const totalOrganizationCount = await Organization.findCount();

            const trainingApps = await TrainingApplication.findByDepartmentId(department_id);
            const trainingApplicationCount = trainingApps ? trainingApps.length : 0;
            const approvedTrainingApplicationCount = trainingApps ? trainingApps.filter(app => app.status_id === 1).length : 0;

            const placementApps = await PlacementApplication.findByDepartmentId(department_id);
            const placementApplicationCount = placementApps ? placementApps.length : 0;
            const approvedPlacementApplicationCount = placementApps ? placementApps.filter(app => app.status_id === 1).length : 0;

            return {
                studentCount: studentInDepartmentCount ?? 0,
                organizationCount: totalOrganizationCount ?? 0,
                trainingApplicationCount: trainingApplicationCount,
                trainingPercentage: trainingApplicationCount > 0 ? (approvedTrainingApplicationCount / trainingApplicationCount) * 100 : 0,
                placementApplicationCount: placementApplicationCount,
                placementApplicationPercentage: placementApplicationCount > 0 ? (approvedPlacementApplicationCount / placementApplicationCount) * 100 : 0
            };
        }
        default: 
            throw new ApiError(404, "This role can't have dashboard");
    }
}