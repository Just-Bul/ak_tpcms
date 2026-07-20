import type { ICategory } from "./category.type.js";
import ApiError from "../../utils/ApiError.js";
import Category from "./category.model.js";

export const getAllCategoryService = async (): Promise<ICategory[]> => {
    const categoryList = await Category.findAll();
    if (!categoryList) {
        throw new ApiError(500, "Could not fetch category list");
    }

    return categoryList;
}