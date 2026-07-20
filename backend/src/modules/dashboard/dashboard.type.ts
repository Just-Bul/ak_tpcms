import type { IPlacement } from "../placement/placement.type.js";
import type { IPlacementApplication } from "../placement_application/placement_application.type.js";
import type { ITraining } from "../training/training.type.js";
import type { ITrainingApplication } from "../training_application/training_application.type.js";


export type AdminDashboardOutput = {
    studentCount: number;
    departmentCount: number;
    organizationCount: number;
    trainingCount: number;
    trainingPercentage: number;
    placementCount: number;
    placementPercentage: number;
};

export type StudentDashboardOutput = {
    appliedTrainings: ITrainingApplication[];
    eligibleTrainings: ITraining[];
    appliedPlacement: IPlacementApplication[];
    eligiblePlacement: IPlacement[];
};

export type DepartmentDashboardOutput = {
    studentCount: number;
    organizationCount: number;
    trainingApplicationCount: number;
    trainingPercentage: number;
    placementApplicationCount: number;
    placementApplicationPercentage: number;
};
