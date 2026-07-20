import prisma from "../../config/db.prisma.js";


class Category {
    static async findById(category_id: number) {
        const category = await prisma.category_table.findUnique({
            where: {
                category_id
            }
        });
        return category;
    }

    static async findAll() {
        const categoryList = await prisma.category_table.findMany();
        return categoryList;
    }
}

export default Category;