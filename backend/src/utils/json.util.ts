import ApiError from "./ApiError.js";

const json = (data: Object | string | null | undefined) => {
    if (typeof data === "undefined" || data === null) {
        return new ApiError(400, "Request body is undefined or null");
    }
    if (typeof data === "string") {
        return data;
    }
    return JSON.stringify(data);
};