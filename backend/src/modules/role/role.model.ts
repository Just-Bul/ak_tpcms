import prisma from "../../config/db.prisma.js";

class Role {
    static SuperAdmin: number = 1; 
    static Student: number = 2; 
    static Coordinator: number = 3; 
    static Organization: number = 4; 

    static async findById(role_id: number) {
        const role = await prisma.role_table.findUnique({
            where: {
                role_id
            }
        });
        return role;
    }

    static async findAll() {
        const roleList = await prisma.role_table.findMany();
        return roleList;
    }
}

export default Role;