import type { Request, Response, NextFunction } from "express";
import {createTrainingApplicationService, getOneTrainingApplicationService, updateTrainingApplicationStatusService, viewTrainingApplicationService } from "./training_application.service.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import type { trainingApplicationApproveData, TrainingApplicationCreateInput, trainingApplicationIdParamInput, trainingApplicationQueryInput } from "./training_application.type.js";

export const createTrainingApplicationController = async (
    req: Request<{}, {}, TrainingApplicationCreateInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const newTrainingApplication = await createTrainingApplicationService(req.body, req.user as UserJwtPayload);
        res.status(201).json({
            success: true,
            message: "Training Applcation created successfully",
            data: newTrainingApplication
        });
    } catch(error) {
        next(error);
    }
}

export const viewTrainingApplicationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const appliedTrainings = await viewTrainingApplicationService(req.user as UserJwtPayload);

        res.status(200).json({
            success: true,
            message: "Training Application fetch successfull",
            data: appliedTrainings
        });
    } catch (error) {
        next(error);
    }
}

export const updateTrainingApplicationStatusController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const params = (req.params as trainingApplicationIdParamInput);
        const {student_id, training_id} = params;
        const {remarks} = (req.body as trainingApplicationApproveData);
        const { status } = (req.query as trainingApplicationQueryInput);
        const approvedTraining = await updateTrainingApplicationStatusService({student_id, training_id, remarks, status}, req.user as UserJwtPayload);
        res.status(200).json({
            success: true,
            message: `Training Application ${status} successfull`,
            data: approvedTraining
        });
    } catch (error) {
        next(error);
    }
}

export const getOneTrainingApplicationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const params = (req.params as trainingApplicationIdParamInput);
        const {student_id, training_id} = params;
        const trainingApplication = await getOneTrainingApplicationService(student_id, training_id, req.user as UserJwtPayload);
        res.status(200).json({
            success: true,
            message: "Training Application fetched successfull",
            data: trainingApplication
        });
    } catch (error) {
        next(error);
    }
}