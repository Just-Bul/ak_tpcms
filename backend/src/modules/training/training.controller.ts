import type { Request, Response, NextFunction } from "express";
import { createTrainingService, disableOneTrainingService, getOneTrainingService, getTrainingService } from "./training.service.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import type { TrainingCreateInput, TrainingIdParamInput } from "./training.type.js";


export const createTrainingController = async (
    req: Request<{}, {}, TrainingCreateInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const newTraining = await createTrainingService(req.body, req.user as UserJwtPayload);
        res.status(201).json({
            success: true,
            message: "Successfully created training",
            data: newTraining
        });
    } catch (error) {
        next(error);
    }
}

export const getTrainingController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const trainingList = await getTrainingService(req.user as UserJwtPayload);
        res.status(201).json({
            success: true,
            message: "Successfully fetched all trainings",
            data: trainingList
        });
    } catch (error) {
        next(error);
    }
}

export const getOneTrainingController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const training_id = (req.params as TrainingIdParamInput).training_id;
        const trainingList = await getOneTrainingService(training_id, req.user as UserJwtPayload);
        res.status(201).json({
            success: true,
            message: "Successfully fetched training",
            data: trainingList
        });
    } catch (error) {
        next(error);
    }
}

export const disableOneTrainingController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const training_id = (req.params as TrainingIdParamInput).training_id;
        const training = await disableOneTrainingService(training_id, req.user as UserJwtPayload);
        res.status(201).json({
            success: true,
            message: "Successfully disabled training",
            data: training
        });
    } catch (error) {
        next(error);
    }
}