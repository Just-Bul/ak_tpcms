import { Prisma } from "@prisma/client";
import prisma from "../../config/db.prisma.js";
import Student from "../student/student.model.js";
import Data from "../../utils/data.util.js";
import type { TrainingCreateData } from "./training.type.js";

class Training {
    static async findById(training_id: number) {
        const training = await prisma.training_table.findUnique({
            where: {training_id}
        });
        return training;
    }

    static async create(trainingData: TrainingCreateData) {
        const { only_semester, only_department, ...dbData } = trainingData;

        const data: Prisma.training_tableUncheckedCreateInput = {
            ...dbData
        };

        if (only_semester && only_semester.length > 0) {
            data.training_semester_table = {
                create: only_semester.map(id => ({ semester_id: id }))
            };
        }

        if (only_department && only_department.length > 0) {
            data.training_department_table = {
                create: only_department.map(id => ({ department_id: id }))
            };
        }

        const newTraining = await prisma.training_table.create({
            data: data
        });
        return newTraining;
    }

    static async findCount(): Promise<number> {
        const trainingCount = await prisma.training_table.count();
        return trainingCount;
    }

    static async findCountByFilter(filter: {
        department_id?: number,
        student_id?: number,
        status_id?: number,
        is_active?: boolean
    }): Promise<number | null> {
        const whereClause: Prisma.training_tableWhereInput = {};
        if (filter.is_active !== undefined) {
            whereClause.is_active = filter.is_active;
        }

        if (filter.department_id !== undefined) {
            whereClause.training_department_table = {
                some: {
                    department_id: filter.department_id
                }
            }
        }

        if (filter.student_id !== undefined) {
            whereClause.training_application_table = {
                some: {
                    student_id: filter.student_id
                }
            }
        }

        if (filter.student_id !== undefined || filter.status_id !== undefined) {
            whereClause.training_application_table = {
                some: Data.filterUndefined({
                    student_id: filter.student_id,
                    status_id: filter.status_id
                })
            }
        }

        const trainingCount = await prisma.training_table.count({
            where: whereClause
        });

        return trainingCount;
    }  

    static async findByFilter(filter: {
        department_id?: number,
        student_id?: number,
        status_id?: number,
        is_active?: boolean
    }) {
        const whereClause: Prisma.training_tableWhereInput = {};
        if (filter.is_active !== undefined) {
            whereClause.is_active = filter.is_active;
        }

        if (filter.department_id !== undefined) {
            whereClause.training_department_table = {
                some: {
                    department_id: filter.department_id
                }
            }
        }

        if (filter.student_id !== undefined) {
            whereClause.training_application_table = {
                some: {
                    student_id: filter.student_id
                }
            }
        }

        if (filter.student_id !== undefined || filter.status_id !== undefined) {
            whereClause.training_application_table = {
                some: Data.filterUndefined({
                    student_id: filter.student_id,
                    status_id: filter.status_id
                })
            }
        }

        const trainingCount = await prisma.training_table.findMany({
            where: whereClause
        });

        return trainingCount;
    }  
    
    static async findOneEligibleById(training_id: number, student_id: number) {
        const student = await Student.findById(student_id);
        if (!student) return null;

        const training = await prisma.training_table.findFirst({
            where: {
                training_id: training_id,
                is_active: true
            },
            include: {
                training_department_table: true,
                training_semester_table: true,
                user_table: {
                    include: {
                        organization_table: {
                            include: {
                                sector_table: true
                            }
                        }
                    }
                }
            }
        });

        if (!training) return null;

        // Perform eligibility checks
        // 1. CGPA Check
        if (training.min_cgpa !== null) {
            const studentCgpa = Number(student.cgpa);
            const minCgpa = Number(training.min_cgpa);
            if (studentCgpa < minCgpa) return null;
        }

        // 2. Department Check
        const allowedDepts = training.training_department_table || [];
        if (allowedDepts.length > 0) {
            const deptIds = allowedDepts.map((d) => d.department_id);
            if (!student.department_id || !deptIds.includes(student.department_id)) {
                return null;
            }
        }

        // 3. Semester Check
        const allowedSemesters = training.training_semester_table || [];
        if (allowedSemesters.length > 0) {
            const semIds = allowedSemesters.map((s) => s.semester_id);
            if (!student.semester_id || !semIds.includes(student.semester_id)) {
                return null;
            }
        }

        // 4. Deadline Check
        if (training.last_date_of_submission) {
            const now = new Date();
            const lastDate = new Date(training.last_date_of_submission);
            if (now > lastDate) return null;
        }

        return training;
    }

    static async findEligibleById(student_id: number) {
        const student = await Student.findById(student_id);
        if (!student) return [];

        const trainingList = await prisma.training_table.findMany({
            where: {
                is_active: true
            },
            include: {
                training_department_table: true,
                training_semester_table: true,
                user_table: {
                    include: {
                        organization_table: {
                            include: {
                                sector_table: true
                            }
                        }
                    }
                }
            }
        });

        // Filter list based on student eligibility criteria
        const eligibleList = trainingList.filter((training) => {
            // 1. CGPA Check
            if (training.min_cgpa !== null) {
                const studentCgpa = Number(student.cgpa);
                const minCgpa = Number(training.min_cgpa);
                if (studentCgpa < minCgpa) return false;
            }

            // 2. Department Check
            const allowedDepts = training.training_department_table || [];
            if (allowedDepts.length > 0) {
                const deptIds = allowedDepts.map((d) => d.department_id);
                if (!student.department_id || !deptIds.includes(student.department_id)) {
                    return false;
                }
            }

            // 3. Semester Check
            const allowedSemesters = training.training_semester_table || [];
            if (allowedSemesters.length > 0) {
                const semIds = allowedSemesters.map((s) => s.semester_id);
                if (!student.semester_id || !semIds.includes(student.semester_id)) {
                    return false;
                }
            }

            // 4. Deadline Check
            if (training.last_date_of_submission) {
                const now = new Date();
                const lastDate = new Date(training.last_date_of_submission);
                if (now > lastDate) return false;
            }

            return true;
        });

        return eligibleList;
    }

    static async findByCreatorId(creator_id: number) {
        const trainingList = await prisma.training_table.findMany({
            where: {
                creator_id: creator_id
            }
        });
        return trainingList;
    }

    static async disable(training_id: number) {
        const training = await prisma.training_table.update({
            where: {
                training_id
            },
            data: {
                is_active: false
            }
        });
        return training;
    }
}

export default Training;