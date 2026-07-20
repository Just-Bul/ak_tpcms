import ApiError from "../../utils/ApiError.js";
import Skill from "./skill.model.js";
import type { ISkill } from "./skill.type.js";


export const getAllSkillService = async (): Promise<ISkill[]> => {
    const skillList = await Skill.findAll();
    if (!skillList) {
        throw new ApiError(500, "Could not fetch skill list");
    }

    return skillList;
}