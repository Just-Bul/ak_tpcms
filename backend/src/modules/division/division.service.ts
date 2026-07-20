import ApiError from "../../utils/ApiError.js";
import Division from "./division.model.js";
import type { IDivision } from "./division.type.js";


export const getAllDivisonService = async (): Promise<IDivision[]> => {
    const divisionList = await Division.findAll();
    if (!divisionList) {
        throw new ApiError(500, "Could not fetch division list");
    }

    return divisionList;
}