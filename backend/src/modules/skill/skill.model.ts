import prisma from "../../config/db.prisma.js";

class Skill {
    static async findById(skill_id: number) {
        const skill = await prisma.skill_table.findUnique({
            where: {
                skill_id
            }
        });
        return skill;
    }

    static async findAll() {
        const skillList = await prisma.skill_table.findMany();
        return skillList;
    }
}

export default Skill;