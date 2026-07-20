import ApiError from "../../utils/ApiError.js";
import Master from "./master.model.js"

const cache: Record<string, {data: any; expiry: number}> = {};
const CACHE_TTL = 60 * 60 * 1000;

export const masterGetService = async (type: string) => {
    const now = Date.now();
    if (cache[type] && cache[type].expiry > now) {
        return cache[type].data;
    }

    const data = await Master.findByType(type);
    if (!data) {
        throw new ApiError(404, `Master type '${type}' not found`);
    }
    cache[type] = {data, expiry: now + CACHE_TTL};
    
    return data;
}