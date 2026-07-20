import prisma from "../../config/db.prisma.js";

class Master {
    static async findByType(type: string) {
        switch (type) {
            case "genders":
                return await prisma.gender_table.findMany();
            case "semesters":
                return await prisma.semester_table.findMany({
                    orderBy: {
                        semester_id: "asc"
                    }
                });
            case "divisions":
                return await prisma.division_table.findMany();
            case "categories":
                return await prisma.category_table.findMany();
            case "skills":
                return await prisma.skill_table.findMany();
            case "sectors":
                return await prisma.sector_table.findMany();
            default:
                return null;
        }
    }
}

export default Master;