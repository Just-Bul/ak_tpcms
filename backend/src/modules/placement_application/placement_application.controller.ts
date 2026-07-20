import type { Request, Response, NextFunction } from "express";
import type { PlacementApplicationCreateInput, PlacementApplicationIdParamInput } from "./placement_application.type.js";
import { approvePlacementApplicationService, createPlacementApplicationService, getOnePlacementApplicationService, viewPlacementApplicationService, rejectPlacementApplicationService } from "./placement_application.service.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";

export const createPlacementApplicationController = async (
    req: Request<{}, {}, PlacementApplicationCreateInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const newPlacementApplication = await createPlacementApplicationService(req.body, req.user as UserJwtPayload);
        res.status(201).json({
            success: true,
            message: "Placement Application created successfully",
            data: newPlacementApplication
        });
    } catch(error) {
        next(error);
    }
}

export const viewPlacementApplicationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const appliedPlacement = await viewPlacementApplicationService(req.user as UserJwtPayload);

        res.status(200).json({
            success: true,
            message: "Placement Applications fetched successfully",
            data: appliedPlacement
        });
    } catch (error) {
        next(error);
    }
}

export const approvePlacementApplicationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const params = (req.params as PlacementApplicationIdParamInput);
        const {student_id, placement_id} = params;
        const { status } = req.body;

        let result;
        let message = "Placement Application approved successfully";

        if (status === "Rejected" || status === "rejected") {
            result = await rejectPlacementApplicationService(student_id, placement_id, req.user as UserJwtPayload);
            message = "Placement Application rejected successfully";
        } else {
            result = await approvePlacementApplicationService(student_id, placement_id, req.user as UserJwtPayload);
        }

        res.status(200).json({
            success: true,
            message,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const getOnePlacementApplicationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const params = (req.params as PlacementApplicationIdParamInput);
        const {student_id, placement_id} = params;
        const placementApplication = await getOnePlacementApplicationService(student_id, placement_id, req.user as UserJwtPayload);
        res.status(200).json({
            success: true,
            message: "Training Application approved successfull",
            data: placementApplication
        });
    } catch (error) {
        next(error);
    }
}