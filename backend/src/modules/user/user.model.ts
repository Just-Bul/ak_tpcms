import { Prisma } from "@prisma/client";
import prisma from "../../config/db.prisma.js";

class User {
    static async findByEmail(email: string) {
        const user = prisma.user_table.findUnique({
            where: {email},
            include: {
                role_table: true
            }
        });
        return user;
    }

    static async findById(user_id: number) {
        const user = prisma.user_table.findUnique({
            where: {user_id},
            include: {
                role_table: true
            }
        });
        return user;
    }
    
    static async create(userData: {
        email: string,
        password: string,
        role_id: number,
        mobile_no?: string | undefined,
        name: string
    }) {
        const newUser = await prisma.user_table.create({
            data: {
                email: userData.email,
                password: userData.password,
                role_id: userData.role_id,
                mobile_no: userData.mobile_no ?? null,
                name: userData.name
            }
        });
        return newUser;
    }

    static async updateLastLogin(user_id: number) {
        await prisma.user_table.update({
            where: {
                user_id: user_id
            },
            data: {
                last_login: new Date()
            }
        })
    }

    static async findAll() {
        const userList = await prisma.user_table.findMany({
            include: {
                role_table: true
            }
        });
        return userList;
    }

    static async update(user_id: number, data: {
        name?: string,
        email?: string,
        mobile_no?: string | null,
    }) {
        const user = await prisma.user_table.update({
            where: { user_id },
            data: data
        });
        return user;
    }

    static async updatePassword(user_id: number, password: string) {
        const user = await prisma.user_table.update({
            where: {
                user_id
            },
            data: {
                password
            }
        });
        return user;
    }
}

export default User;