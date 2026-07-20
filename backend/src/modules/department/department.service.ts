import type { DepartmentDashboardOutput, DepartmentRegisterInput, DepartmentUpdateInput, IDepartment } from "./department.type.js";
import ApiError from "../../utils/ApiError.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import { dashboardService } from "../dashboard/dashboard.service.js";
import Department from "./department.model.js";
import Data from "../../utils/data.util.js";
import PasswordManager from "../../utils/password.util.js";

export const getAllDepartmentService = async () => {
    const departmentList = await Department.findAll();
    if (!departmentList) {
        throw new ApiError(500, "Could not fetch department");
    }

    return departmentList;
}

export const departmentRegisterService = async (input: DepartmentRegisterInput,actor: UserJwtPayload) => {
    input.password = await PasswordManager.hashPassword(input.password);
    const departmentDashboard = await Department.create(input);
    if (!departmentDashboard) {
        throw new ApiError(500, "Could not fetch department dashboard");
    }

    return departmentDashboard;
}

export const departmentUpdateService = async (department_id: number, input: DepartmentUpdateInput,actor: UserJwtPayload) => {
    const updateData = Data.filterUndefined({
        department_name: input.department_name,
        email: input.email,
        name: input.name,
        is_active: input.is_active
    });
    const department = await Department.update(department_id, updateData);
    if (!department) {
        throw new ApiError(500, "Could not fetch department dashboard");
    }

    return department;
}

export const updateDepartmentActiveStateService = async (department_id: number, status: "activate" | "deactivate") => {
    const department = await Department.updateActiveState(department_id, status);
    if (!department) {
        throw new ApiError(404, "Department not found");
    }
    return department;
}