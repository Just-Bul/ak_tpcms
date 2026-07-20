import prisma from "../../config/db.prisma.js";

class Semester {
    static async findById(semester_id: number) {
        const semester = await prisma.semester_table.findUnique({
            where: {
                semester_id
            }
        });
        return semester;
    }

    static async findAll() {
        const semesterList = await prisma.semester_table.findMany({
            orderBy: {
                semester_id: "asc"
            }
        });
        return semesterList;
    }
}

export default Semester;