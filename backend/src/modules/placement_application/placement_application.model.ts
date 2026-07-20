import type { Prisma } from "@prisma/client";
import prisma from "../../config/db.prisma.js";
import type { IPlacementApplication, PlacementApplicationCreateData } from "./placement_application.type.js";

class PlacementApplication {
    static async findById(student_id: number, placement_id: number) {
        const placementApplication = await prisma.placement_application_table.findUnique({
            where: {
                placement_id_student_id: {
                    placement_id,
                    student_id
                }
            }
        });
        return placementApplication;
    }

    static async create(placementApplicationData: PlacementApplicationCreateData) {
        const newPlacementApplication = await prisma.placement_application_table.create({
            data: placementApplicationData
        });
        return newPlacementApplication;
    }

    static async findCount(): Promise<number | null> {
        const applicationCount = await prisma.placement_application_table.count();
        return applicationCount;
    }

    static async findByStudentId(student_id: number) {
        const appliedPlacement = await prisma.placement_application_table.findMany({
            where: {
                student_id
            },
            include: {
                placement_table: {
                    include: {
                        user_table: {
                            include: {
                                organization_table: true
                            }
                        }
                    }
                }
            }
        });

        return appliedPlacement
    }

    static async findByCreatorId(creator_id: number) {
        const appliedPlacement = await prisma.placement_application_table.findMany({
            where: {
                placement_table: {
                    creator_id: creator_id
                }
            },
            include: {
                placement_table: true,
                student_table: {
                    include: {
                        user_table: {
                            select: {
                                user_id: true,
                                name: true,
                                email: true,
                                role_id: true,
                                mobile_no: true,
                                created_on: true,
                                updated_on: true,
                                last_login: true
                            }
                        },
                        department_table: true
                    }
                }
            }
        });

        return appliedPlacement
    }

    static async findByDepartmentId(department_id: number) {
        const appliedPlacement = await prisma.placement_application_table.findMany({
            where: {
                placement_table: {
                    creator_id: department_id
                },
                student_table: {
                    department_id
                }
            },
            include: {
                placement_table: true,
                student_table: {
                    include: {
                        user_table: {
                            select: {
                                user_id: true,
                                name: true,
                                email: true,
                                role_id: true,
                                mobile_no: true,
                                created_on: true,
                                updated_on: true,
                                last_login: true
                            }
                        },
                        department_table: true
                    }
                }
            }
        });

        return appliedPlacement
    }

    static async approve(student_id: number, placement_id: number) {
        const approvedPlacement = await prisma.placement_application_table.update({
            where: {
                placement_id_student_id: {
                    student_id: student_id,
                    placement_id: placement_id
                }
            },
            data: {
                status_id: 2
            }
        });

        return approvedPlacement;
    }

    static async reject(student_id: number, placement_id: number) {
        const rejectedPlacement = await prisma.placement_application_table.update({
            where: {
                placement_id_student_id: {
                    student_id: student_id,
                    placement_id: placement_id
                }
            },
            data: {
                status_id: 3
            }
        });

        return rejectedPlacement;
    }

    static async findCountByFilter(filter: {
        creator_id?: number,
        status_id?: number,
        student_id?: number,
    }): Promise<number | null> {
        const whereClause: Prisma.placement_application_tableWhereInput = {};

        if (filter.student_id !== undefined) {
            whereClause.student_id = filter.student_id;
        }

        if (filter.status_id !== undefined) {
            whereClause.status_id = filter.status_id;
        }

        if (filter.creator_id !== undefined) {
            whereClause.placement_table = {
                creator_id: filter.creator_id,
                
            }
        }

        const applicationCount = await prisma.placement_application_table.count({
            where: whereClause
        });

        return applicationCount;
    }




    static async findByFilter(filter: {
        creator_id?: number,
        status_id?: number,
        student_id?: number,
    }) {
        const whereClause: Prisma.placement_application_tableWhereInput = {};

        if (filter.student_id !== undefined) {
            whereClause.student_id = filter.student_id;
        }

        if (filter.status_id !== undefined) {
            whereClause.status_id = filter.status_id;
        }

        if (filter.creator_id !== undefined) {
            whereClause.placement_table = {
                creator_id: filter.creator_id,
                
            }
        }

        const applicationCount = await prisma.placement_application_table.findMany({
            where: whereClause
        });

        return applicationCount;
    }
}

export default PlacementApplication;