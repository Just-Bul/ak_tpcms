import type { Request, Response, NextFunction } from "express";
import type { PlacementCreateInput, PlacementIdParamInput } from "./placement.type.js";
import { createPlacementService, getOnePlacementService, getPlacementService } from "./placement.service.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";


export const createPlacementController = async (
    req: Request<{}, {}, PlacementCreateInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const newPlacement = await createPlacementService(req.body, req.user as UserJwtPayload);
        res.status(201).json({
            success: true,
            message: "Successfully created placement",
            data: newPlacement
        });
    } catch (error) {
        next(error);
    }
}

export const getPlacementController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const placementList = await getPlacementService(req.user as UserJwtPayload);
        res.status(200).json({
            success: true,
            message: "Successfully fetched all placements",
            data: placementList
        });
    } catch (error) {
        next(error);
    }
}

export const getOnePlacementController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const placement_id = (req.params as PlacementIdParamInput).placement_id;
        const placementList = await getOnePlacementService(placement_id, req.user as UserJwtPayload);
        res.status(200).json({
            success: true,
            message: "Successfully fetched placement",
            data: placementList
        });
    } catch (error) {
        next(error);
    }
}