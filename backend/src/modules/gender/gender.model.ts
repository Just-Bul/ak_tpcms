import prisma from "../../config/db.prisma.js";

class Gender {
    static async findById(gender_id: number) {
        const gender = await prisma.gender_table.findUnique({
            where: {
                gender_id
            }
        });
        return gender;
    }

    static async findAll() {
        const genderList = await prisma.gender_table.findMany();
        return genderList;
    }
}

export default Gender;