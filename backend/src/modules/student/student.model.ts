import prisma from "../../config/db.prisma.js";
import { Prisma } from "@prisma/client";
import Data from "../../utils/data.util.js";
import type { StudentCreateData, StudentFilterQuery, StudentUpdateData } from "./student.type.js";
import Role from "../role/role.model.js";

class Student {
    private static studentIncludes = {
        training_application_table: true,
        department_table: true,
        student_skill_table: {
            include: {
                skill_table: true
            }
        },
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
        gender_table: true,
        category_table: true,
        semester_table: true,
        division_table_student_table_tenth_division_idTodivision_table: true,
        division_table_student_table_twelfth_division_idTodivision_table: true,
        alumni_table: true,
        student_document_table: true
    };

    private static buildWhereClause(filter?: StudentFilterQuery): Prisma.student_tableWhereInput {
        const where: Prisma.student_tableWhereInput = {};
        if (!filter) return where;

        // 1. Status: Active = Regular, Disabled = Alumni
        const status = filter.status?.toLowerCase();
        if (status === "regular" || status === "active" || filter.is_graduate === false || filter.graduation === false) {
            where.is_graduate = false;
        } else if (status === "alumni" || status === "disabled" || filter.is_graduate === true || filter.graduation === true) {
            where.is_graduate = true;
        }

        // 2. Grade / CGPA filter (e.g. min_cgpa, max_cgpa, grade)
        const minCgpa = filter.min_cgpa ?? filter.grade;
        const maxCgpa = filter.max_cgpa;
        if (minCgpa !== undefined || maxCgpa !== undefined) {
            where.cgpa = {};
            if (minCgpa !== undefined) {
                where.cgpa.gte = new Prisma.Decimal(minCgpa);
            }
            if (maxCgpa !== undefined) {
                where.cgpa.lte = new Prisma.Decimal(maxCgpa);
            }
        }

        // 3. Semester filter
        if (filter.semester_id !== undefined) {
            where.semester_id = filter.semester_id;
        }

        // 4. Branch / Department filter
        const deptId = filter.department_id ?? filter.branch_id;
        if (deptId !== undefined) {
            where.department_id = deptId;
        }

        // 5. Graduation Year / Passing Year filter
        const gradYear = filter.graduation_year ?? filter.passing_year;
        if (gradYear !== undefined) {
            where.OR = [
                { graduation_year: gradYear },
                { alumni_table: { passing_year: gradYear } }
            ];
        }

        // 6. Backlog filter
        if (filter.has_backlog !== undefined) {
            where.has_backlog = filter.has_backlog;
        }

        // 7. Search keyword across student name, roll_no, email
        if (filter.search && filter.search.trim() !== "") {
            const term = filter.search.trim();
            const searchClause: Prisma.student_tableWhereInput[] = [
                { roll_no: { contains: term } },
                { user_table: { name: { contains: term } } },
                { user_table: { email: { contains: term } } }
            ];
            if (where.OR) {
                where.AND = [
                    { OR: where.OR },
                    { OR: searchClause }
                ];
                delete where.OR;
            } else {
                where.OR = searchClause;
            }
        }

        return where;
    }

    static async findById(user_id: number) {
        const student = await prisma.student_table.findUnique({
            where: { user_id },
            include: Student.studentIncludes
        });
        return student;
    }

    static async findByEmail(email: string) {
        const student = await prisma.student_table.findFirst({
            where: {
                user_table: {
                    email
                }
            },
            include: Student.studentIncludes
        });
        return student;
    }

    static async create(studentData: StudentCreateData) {
        const newStudent = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user_table.create({
                data: {
                    email: studentData.email,
                    password: studentData.password,
                    role_id: Role.Student,
                    name: studentData.name
                }
            });

            const isGraduateValue = studentData.graduation !== undefined ? studentData.graduation : (studentData.is_graduate ?? false);
            const newStudent = await tx.student_table.create({
                data: {
                    user_id: newUser.user_id,
                    roll_no: studentData.roll_no,
                    department_id: studentData.department_id ?? null,
                    semester_id: studentData.semester_id ?? null,
                    is_graduate: isGraduateValue,
                    graduation: isGraduateValue,
                    graduation_year: studentData.graduation_year ?? null,
                    grade_card_url: studentData.grade_card_url ?? null
                }
            });

            if (isGraduateValue && studentData.graduation_year) {
                await tx.alumni_table.create({
                    data: {
                        user_id: newUser.user_id,
                        passing_year: studentData.graduation_year
                    }
                });
            }

            return newStudent;
        });
        return newStudent;
    }

    static async findCount(filter?: StudentFilterQuery): Promise<number> {
        const where = Student.buildWhereClause(filter);
        const studentCount = await prisma.student_table.count({ where });
        return studentCount;
    }

    static async findAll(filter?: StudentFilterQuery) {
        const where = Student.buildWhereClause(filter);
        const studentList = await prisma.student_table.findMany({
            where,
            include: Student.studentIncludes,
            orderBy: { user_id: 'desc' }
        });
        return studentList;
    }

    static async findByCoordinatorId(coordinator_id: number, filter?: StudentFilterQuery) {
        const baseWhere = Student.buildWhereClause(filter);
        const where: Prisma.student_tableWhereInput = {
            ...baseWhere,
            department_table: {
                coordinator_id
            }
        };

        const studentList = await prisma.student_table.findMany({
            where,
            include: Student.studentIncludes,
            orderBy: { user_id: 'desc' }
        });
        return studentList;
    }

    static async findByDepartmentId(department_id: number, filter?: StudentFilterQuery) {
        const baseWhere = Student.buildWhereClause(filter);
        const where: Prisma.student_tableWhereInput = {
            ...baseWhere,
            department_id
        };

        const studentList = await prisma.student_table.findMany({
            where,
            include: Student.studentIncludes,
            orderBy: { user_id: 'desc' }
        });
        return studentList;
    }

    static async findCountByDepartmentId(department_id: number): Promise<number> {
        const studentCount = await prisma.student_table.count({
            where: {
                department_id
            }
        });
        return studentCount;
    }

    static async update(user_id: number, updateData: StudentUpdateData, skills?: string[]) {
        const userData: Prisma.user_tableUncheckedUpdateInput = Data.filterUndefined({
            email: updateData.email,
            mobile_no: updateData.mobile_no,
            name: updateData.name
        });

        // Determine graduation status from is_graduate, graduation, or status enum
        let isGraduateValue = updateData.graduation !== undefined ? updateData.graduation : updateData.is_graduate;
        if (updateData.status) {
            const st = updateData.status.toLowerCase();
            if (st === "regular" || st === "active") isGraduateValue = false;
            else if (st === "alumni" || st === "disabled") isGraduateValue = true;
        }

        const studentData: Prisma.student_tableUncheckedUpdateInput = Data.filterUndefined({
            has_backlog: updateData.has_backlog,
            cgpa: updateData.cgpa,
            resume_url: updateData.resume_url,
            image_url: updateData.image_url,
            tenth_division_id: updateData.tenth_division_id,
            twelfth_division_id: updateData.twelfth_division_id,
            category_id: updateData.category_id,
            department_id: updateData.department_id,
            semester_id: updateData.semester_id,
            gender_id: updateData.gender_id,
            date_of_birth: updateData.date_of_birth,
            roll_no: updateData.roll_no,
            is_graduate: isGraduateValue,
            graduation: isGraduateValue,
            graduation_year: updateData.graduation_year ?? updateData.passing_year,
            grade_card_url: updateData.grade_card_url
        });

        const student = await prisma.$transaction(async (tx) => {
            if (skills !== undefined) {
                if (skills.length > 0) {
                    await tx.skill_table.createMany({
                        data: skills.map((skillName) => ({ skill: skillName })),
                        skipDuplicates: true
                    });

                    const dbSkills = await tx.skill_table.findMany({
                        where: {
                            skill: { in: skills }
                        },
                        select: {
                            skill_id: true
                        }
                    });

                    await tx.student_skill_table.deleteMany({
                        where: { user_id }
                    });

                    await tx.student_skill_table.createMany({
                        data: dbSkills.map((dbSkill) => ({
                            user_id,
                            skill_id: dbSkill.skill_id
                        }))
                    });
                } else {
                    await tx.student_skill_table.deleteMany({
                        where: { user_id }
                    });
                }
            }

            if (Object.keys(userData).length > 0) {
                await tx.user_table.update({
                    where: { user_id },
                    data: userData
                });
            }

            const updated = await tx.student_table.update({
                where: { user_id },
                data: studentData,
                include: Student.studentIncludes
            });

            // Upsert alumni_table if marked as graduate / alumni, or if passing_year provided
            if (isGraduateValue === true || updateData.passing_year !== undefined || updateData.graduation_year !== undefined) {
                const rawYear = updateData.passing_year ?? updateData.graduation_year ?? updated.graduation_year ?? new Date().getFullYear();
                const year = typeof rawYear === "number" ? rawYear : Number(rawYear) || new Date().getFullYear();
                const updateYear = updateData.passing_year !== undefined || updateData.graduation_year !== undefined
                    ? Number(updateData.passing_year ?? updateData.graduation_year)
                    : undefined;

                await tx.alumni_table.upsert({
                    where: { user_id },
                    create: {
                        user_id,
                        passing_year: year,
                        current_company: updateData.current_company ?? null,
                        designation: updateData.designation ?? null
                    },
                    update: Data.filterUndefined({
                        passing_year: updateYear,
                        current_company: updateData.current_company,
                        designation: updateData.designation
                    })
                });
            } else if (isGraduateValue === false) {
                // If explicitly set back to regular, remove alumni record if exists
                await tx.alumni_table.deleteMany({
                    where: { user_id }
                });
            }

            return updated;
        });

        return student;
    }

    static async updateAdmin(user_id: number, updateData: StudentUpdateData) {
        return Student.update(user_id, updateData);
    }

    // ==========================================
    // Student Document Repository Methods
    // ==========================================

    static async createDocument(data: {
        user_id: number;
        document_type: string;
        document_name: string;
        document_url: string;
    }) {
        const doc = await prisma.$transaction(async (tx) => {
            const newDoc = await tx.student_document_table.create({
                data: {
                    user_id: data.user_id,
                    document_type: data.document_type,
                    document_name: data.document_name,
                    document_url: data.document_url,
                    verified: false
                }
            });

            // If the document is a grade card, also set grade_card_url on student_table
            if (data.document_type.toLowerCase().includes("grade")) {
                await tx.student_table.update({
                    where: { user_id: data.user_id },
                    data: {
                        grade_card_url: data.document_url
                    }
                });
            }

            return newDoc;
        });
        return doc;
    }

    static async findDocumentsByUserId(user_id: number) {
        return await prisma.student_document_table.findMany({
            where: { user_id },
            orderBy: { created_on: 'desc' }
        });
    }

    static async findDocumentById(document_id: number) {
        return await prisma.student_document_table.findUnique({
            where: { document_id },
            include: {
                student_table: {
                    include: {
                        user_table: {
                            select: {
                                user_id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
    }

    static async deleteDocument(document_id: number, user_id?: number) {
        const where: Prisma.student_document_tableWhereInput = { document_id };
        if (user_id !== undefined) {
            where.user_id = user_id;
        }

        const deleted = await prisma.student_document_table.deleteMany({
            where
        });
        return deleted.count > 0;
    }

    static async verifyDocument(document_id: number, verified: boolean = true) {
        return await prisma.student_document_table.update({
            where: { document_id },
            data: { verified }
        });
    }
}

export default Student;