import type { Request, Response, NextFunction } from "express";
import { departmentRegisterService, departmentUpdateService, getAllDepartmentService, updateDepartmentActiveStateService } from "./department.service.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import type { DepartmentIdParamInput, DepartmentRegisterInput, DepartmentUpdateActiveStateInput, DepartmentUpdateInput } from "./department.type.js";
import Data from "../../utils/data.util.js";

export const getAllDepartmentController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const departmentList = await getAllDepartmentService();
        res.status(200).json({
            success: true,
            message: `Fetched all departments`,
            data: departmentList.map((department) => Data.sanitize(department))
        });
    } catch (error) {
        next(error);
    }
}

export const departmentRegisterController = async (
    req: Request<{}, {}, DepartmentRegisterInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const newDepartment = await departmentRegisterService(req.body, req.user as UserJwtPayload);
        res.status(200).json({
            success: true,
            message: "Successfully registered department",
            data: Data.sanitize(newDepartment)
        });
    } catch (error) {
        next(error);
    }
}

export const departmentUpdateController = async (
    req: Request<{}, {}, DepartmentUpdateInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const {department_id} = req.params as DepartmentIdParamInput
        const newDepartment = await departmentUpdateService(department_id, req.body, req.user as UserJwtPayload);
        res.status(200).json({
            success: true,
            message: "Successfully registered department",
            data: Data.sanitize(newDepartment)
        });
    } catch (error) {
        next(error);
    }
}

export const updateDepartmentActiveStateController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { department_id } = req.params as unknown as DepartmentUpdateActiveStateInput['params'];
        const { status } = req.query as unknown as DepartmentUpdateActiveStateInput['query'];
        const organization = await updateDepartmentActiveStateService(department_id, status);
        res.status(200).json({
            success: true,
            message: "Successfully updated department state",
            data: organization
        });
    } catch (error) {
        next(error);
    }
}


