import type { Request, Response, NextFunction } from "express";
import type { NotesCreateInput, NotesIdParamInput } from "./notes.type.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import { noteCreateService, noteGetAllService, noteGetByCreatorService, noteGetOneService } from "./notes.service.js";

export const noteCreateController = async (
    req: Request<{}, {}, NotesCreateInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const note = await noteCreateService(req.body, req.user as UserJwtPayload);
        res.status(201).json({
            success: true,
            message: "Successfully created note",
            data: note
        })
    } catch (error) {
        next(error);
    }
}

export const noteGetAllController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const noteList = await noteGetAllService();
        res.status(201).json({
            success: true,
            message: "Successfully fethced notes",
            data: noteList
        })
    } catch (error) {
        next(error);
    }
}

export const noteGetOneController = async (
    req: Request<NotesIdParamInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { note_id } = req.params;
        const note = await noteGetOneService(note_id);
        res.status(201).json({
            success: true,
            message: "Successfully fetched note",
            data: note
        })
    } catch (error) {
        next(error);
    }
}

export const noteGetByCreatorController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const noteList = await noteGetByCreatorService(req.user as UserJwtPayload);
        res.status(201).json({
            success: true,
            message: "Successfully fetched notes",
            data: noteList
        })
    } catch (error) {
        next(error);
    }
}

