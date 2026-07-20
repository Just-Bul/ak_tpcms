import ApiError from "../../utils/ApiError.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import Notes from "./notes.model.js";
import type { NotesCreateInput } from "./notes.type.js";

export const noteCreateService = async (data: NotesCreateInput, actor: UserJwtPayload) => {
    const note = await Notes.create({
        creator_id: actor.auth_user_id,
        title: data.title,
        description: data.description ?? null,
        note_url: data.note_url
    });

    if (!note) {
        throw new ApiError(500, "Could not create note");
    }

    return note;
}

export const noteGetAllService = async () => {
    const noteList = await Notes.findAll();
    if (!noteList) {
        throw new ApiError(500, "Could not fetch notes");
    }
    return noteList;
}

export const noteGetOneService = async (note_id: number) => {
    const note = await Notes.findById(note_id);
    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    return note;
}

export const noteGetByCreatorService = async (actor: UserJwtPayload) => {
    const noteList = await Notes.findByCreatorId(actor.auth_user_id);
    if (!noteList) {
        throw new ApiError(500, "Coould not fetch notes created by the user");
    }

    return noteList;
}