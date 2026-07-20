
import type { ISemester } from "./semester.type.js";
import ApiError from "../../utils/ApiError.js";
import Semester from "./semester.model.js";

export const getAllSemesterService = async (): Promise<ISemester[]> => {
    const semesterList = await Semester.findAll();
    if (!semesterList) {
        throw new ApiError(500, "Could not fetch semester list");
    }

    return semesterList;
}