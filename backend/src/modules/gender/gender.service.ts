import ApiError from "../../utils/ApiError.js";
import Gender from "./gender.model.js";
import type { IGender } from "./gender.type.js";


export const getAllGenderService = async (): Promise<IGender[]> => {
    const genderList = await Gender.findAll();
    if (!genderList) {
        throw new ApiError(500, "Could not fetch gender list");
    }

    return genderList;
}