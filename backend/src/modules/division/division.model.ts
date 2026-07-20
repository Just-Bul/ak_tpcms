import prisma from "../../config/db.prisma.js";
import type { IDivision } from "./division.type.js";

class Division {
    static async findById(division_id: number) {
        const division = await prisma.division_table.findUnique({
            where: {
                division_id
            }
        });
        return division;
    }
        static async findAll() {
            const divisionList = await prisma.division_table.findMany();
            return divisionList;
        }
}

export default Division;