import prisma from "../../config/db.prisma.js";
import Role from "../role/role.model.js";
import type { IOrganization, OrganizationCreateData, OrganizationUpdateData } from "./organization.type.js";

class Organization {
    static async findById(user_id: number) {
        const organization = await prisma.organization_table.findUnique({
            where: {user_id}
        });
        return organization;
    }

    static async findByEmail(email: string) {
        const user = await prisma.user_table.findFirst({
            where: {
                email: email
            },
            include: {
                organization_table: true
            }
        });
        return user?.organization_table ?? null;
    }

    static async findAll() {
        const organizationList = await prisma.organization_table.findMany({
            include: {
                user_table: true
            }
        });
        return organizationList;
    }

    static async findCount(): Promise<number | null> {
        const organizationCount = await prisma.organization_table.count();
        return organizationCount;
    }

    static async create(organizationData: OrganizationCreateData) {
        const newOrganization = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user_table.create({
                data: {
                    email: organizationData.email,
                    password: organizationData.password,
                    role_id: Role.Organization,
                    name: organizationData.name,
                    mobile_no: organizationData.mobile_no ?? null,
                }
            });

            const newOrganization = await tx.organization_table.create({
                data: {
                    user_id: newUser.user_id,
                    sector_id: organizationData.sector_id ?? null
                }
            });

            return newOrganization;
        });
        return newOrganization;
    }

    static async update(user_id: number, organizationData: OrganizationUpdateData) {
        const organization = await prisma.organization_table.update({
            where: {
                user_id: user_id,
            },
            data: organizationData
        });

        return organization;
    }

    static async findApproved() {
        const organizationList = await prisma.organization_table.findMany({
            where: {
                approval_id: 2
            },
            include: {
                user_table: true
            }
        });
        return organizationList;
    }

    static async findRejected() {
        const organizationList = await prisma.organization_table.findMany({
            where: {
                approval_id: 3
            },
            include: {
                user_table: true
            }
        });
        return organizationList;
    }

    static async findPending() {
        const organizationList = await prisma.organization_table.findMany({
            where: {
                approval_id: 1
            },
            include: {
                user_table: true
            }
        });
        return organizationList;
    }

    static async updateActiveState(user_id: number, state: "activate" | "deactivate") {
        const is_active = (state === "activate")? true : false;
        const organization = await prisma.organization_table.update({
            where: {
                user_id
            },
            data: {
                is_active
            }
        });
        return organization;
    }

}

export default Organization;