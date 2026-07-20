import { Prisma } from "@prisma/client";
import type { PlacementCreateData } from "./placement.type.js";
import prisma from "../../config/db.prisma.js";
import Student from "../student/student.model.js";

class Placement {
    static async findById(placement_id: number) {
        const placement = prisma.placement_table.findUnique({
            where: {placement_id}
        });
        return placement;
    }

    static async create(placementData: PlacementCreateData) {
        const { only_category, only_semester, only_department, ...dbData} = placementData;

        const data: Prisma.placement_tableUncheckedCreateInput = {
            ...dbData
        };

        if (only_category && only_category.length > 0) {
            data.placement_category_table = {
                create: only_category.map((id) => ({category_id: id}))
            }
        }

        if (only_semester && only_semester.length > 0) {
            data.placement_semester_table = {
                create: only_semester.map(id => ({semester_id: id}))
            }
        }

        if (only_department && only_department.length > 0) {
            data.placement_department_table = {
                create: only_department.map(id => ({department_id: id}))
            }
        }


        const newPlacement = prisma.placement_table.create({
            data: data
        });
        return newPlacement;
    }

    static async findCount(): Promise<number | null>  {
        const placementCount = await prisma.placement_table.count();
        return placementCount;
    }
    
    static async findOneEligibleById(placement_id: number, student_id: number) {
        const student = await Student.findById(student_id);
        if (!student) return null;

        const placement = await prisma.placement_table.findFirst({
            where: {
                placement_id: placement_id,
                is_active: true
            },
            include: {
                placement_department_table: true,
                placement_category_table: true,
                placement_semester_table: true,
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

        if (!placement) return null;

        // A. Minimum CGPA Check
        if (placement.min_cgpa !== null) {
            if (student.cgpa === null) return null;
            const studentCgpa = Number(student.cgpa);
            const minCgpa = Number(placement.min_cgpa);
            if (studentCgpa < minCgpa) return null;
        }

        // B. Backlog Check
        if (placement.has_backlog === false) {
            // If placement forbids active backlogs, student has_backlog must be false
            if (student.has_backlog === true) {
                return null;
            }
        }

        // C. Minimum Class 10th Division Check
        if (placement.min_tenth_division_id !== null) {
            if (!student.tenth_division_id) return null;
            // E.g. division_id: 1 (1st Div) is better than 2 (2nd Div).
            // A lower division_id value represents a higher/better division.
            if (student.tenth_division_id > placement.min_tenth_division_id) {
                return null;
            }
        }

        // D. Minimum Class 12th Division Check
        if (placement.min_twelfth_division_id !== null) {
            if (!student.twelfth_division_id) return null;
            if (student.twelfth_division_id > placement.min_twelfth_division_id) {
                return null;
            }
        }

        // E. Target Department / Branch Filter
        const allowedDepts = placement.placement_department_table || [];
        if (allowedDepts.length > 0) {
            const deptIds = allowedDepts.map((d) => d.department_id);
            if (!student.department_id || !deptIds.includes(student.department_id)) {
                return null;
            }
        }

        // F. Target Categories Filter (e.g. Gen/OBC/SC/ST)
        const allowedCategories = placement.placement_category_table || [];
        if (allowedCategories.length > 0) {
            const catIds = allowedCategories.map((c) => c.category_id);
            if (!student.category_id || !catIds.includes(student.category_id)) {
                return null;
            }
        }

        // G. Target Semesters Filter
        const allowedSemesters = placement.placement_semester_table || [];
        if (allowedSemesters.length > 0) {
            const semIds = allowedSemesters.map((s) => s.semester_id);
            if (!student.semester_id || !semIds.includes(student.semester_id)) {
                return null;
            }
        }

        // H. Submission Date Deadline Check
        if (placement.last_date_of_submission) {
            const now = new Date();
            const deadline = new Date(placement.last_date_of_submission);
            if (now > deadline) return null;
        }

        return placement;
    }

    static async findEligibleById(student_id: number) {
        // 1. Fetch the student profile with their academic credentials
        const student = await Student.findById(student_id);
        if (!student) return [];

        // 2. Fetch all active placements from database including target criteria relations
        const placementList = await prisma.placement_table.findMany({
            where: {
                is_active: true
            },
            include: {
                placement_department_table: true,
                placement_category_table: true,
                placement_semester_table: true,
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

        // 3. Filter eligible ones in memory
        const eligiblePlacements = placementList.filter((placement) => {
            // A. Minimum CGPA Check
            if (placement.min_cgpa !== null) {
                if (student.cgpa === null) return false;
                const studentCgpa = Number(student.cgpa);
                const minCgpa = Number(placement.min_cgpa);
                if (studentCgpa < minCgpa) return false;
            }

            // B. Backlog Check
            if (placement.has_backlog === false) {
                // If placement forbids active backlogs, student has_backlog must be false
                if (student.has_backlog === true) {
                    return false;
                }
            }

            // C. Minimum Class 10th Division Check
            if (placement.min_tenth_division_id !== null) {
                if (!student.tenth_division_id) return false;
                // E.g. division_id: 1 (1st Div) is better than 2 (2nd Div).
                // A lower division_id value represents a higher/better division.
                if (student.tenth_division_id > placement.min_tenth_division_id) {
                    return false;
                }
            }

            // D. Minimum Class 12th Division Check
            if (placement.min_twelfth_division_id !== null) {
                if (!student.twelfth_division_id) return false;
                if (student.twelfth_division_id > placement.min_twelfth_division_id) {
                    return false;
                }
            }

            // E. Target Department / Branch Filter
            const allowedDepts = placement.placement_department_table || [];
            if (allowedDepts.length > 0) {
                const deptIds = allowedDepts.map((d) => d.department_id);
                if (!student.department_id || !deptIds.includes(student.department_id)) {
                    return false;
                }
            }

            // F. Target Categories Filter (e.g. Gen/OBC/SC/ST)
            const allowedCategories = placement.placement_category_table || [];
            if (allowedCategories.length > 0) {
                const catIds = allowedCategories.map((c) => c.category_id);
                if (!student.category_id || !catIds.includes(student.category_id)) {
                    return false;
                }
            }

            // G. Target Semesters Filter
            const allowedSemesters = placement.placement_semester_table || [];
            if (allowedSemesters.length > 0) {
                const semIds = allowedSemesters.map((s) => s.semester_id);
                if (!student.semester_id || !semIds.includes(student.semester_id)) {
                    return false;
                }
            }

            // H. Submission Date Deadline Check (Optional but recommended)
            if (placement.last_date_of_submission) {
                const now = new Date();
                const deadline = new Date(placement.last_date_of_submission);
                if (now > deadline) return false;
            }

            return true;
        });

        return eligiblePlacements;
    }

    static async findByCreatorId(creator_id: number) {
        const placementList = await prisma.placement_table.findMany({
            where: {
                creator_id: creator_id
            }
        });
        return placementList;
    }
}

export default Placement;