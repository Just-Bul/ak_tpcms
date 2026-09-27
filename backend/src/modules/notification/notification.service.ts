import prisma from "../../config/db.prisma.js";
import Student from "../student/student.model.js";

export interface NotificationItem {
    id: number;
    notification_type: "placement" | "training";
    title: string;
    description: string | null;
    company_name: string | null;
    image_url: string | null;
    min_cgpa: any;
    salary_range?: string | null;
    last_date_of_submission: Date | null;
    created_on: Date;
    is_eligible: boolean;
    eligibility_reason: string;
    has_applied: boolean;
    application_status: "Pending" | "Approved" | "Rejected" | null;
    verified_by?: number | null;
    verified_at?: Date | null;
    can_apply: boolean;
}

export const notificationGetService = async (data: {
    student_id: number;
    section?: "training" | "placement" | "all";
    filter?: "all" | "eligible" | "ineligible" | "applied";
}): Promise<NotificationItem[]> => {
    const student = await Student.findById(data.student_id);
    const notifications: NotificationItem[] = [];
    const now = new Date();

    const fetchPlacements = !data.section || data.section === "all" || data.section === "placement";
    const fetchTrainings = !data.section || data.section === "all" || data.section === "training";

    if (fetchPlacements) {
        const placements = await prisma.placement_table.findMany({
            where: { is_active: true },
            include: {
                placement_department_table: true,
                placement_category_table: true,
                placement_semester_table: true,
                user_table: {
                    include: {
                        organization_table: true
                    }
                },
                placement_application_table: {
                    where: { student_id: data.student_id }
                }
            },
            orderBy: { created_on: 'desc' }
        });

        for (const p of placements) {
            let isEligible = true;
            let reason = "Eligible to apply";

            const existingApp = p.placement_application_table[0];
            const hasApplied = Boolean(existingApp);
            let appStatus: "Pending" | "Approved" | "Rejected" | null = null;
            if (existingApp) {
                appStatus = existingApp.status_id === 2 ? "Approved" : existingApp.status_id === 3 ? "Rejected" : "Pending";
            }

            let isDeadlinePassed = false;
            if (p.last_date_of_submission) {
                const deadline = new Date(p.last_date_of_submission);
                deadline.setHours(23, 59, 59, 999);
                if (now > deadline) {
                    isDeadlinePassed = true;
                    isEligible = false;
                    reason = "Application deadline has passed";
                }
            }

            if (student && isEligible) {
                // Min CGPA
                if (p.min_cgpa !== null) {
                    if (student.cgpa === null) {
                        isEligible = false;
                        reason = `Minimum CGPA of ${p.min_cgpa} required (your CGPA is not set)`;
                    } else if (Number(student.cgpa) < Number(p.min_cgpa)) {
                        isEligible = false;
                        reason = `Minimum CGPA of ${p.min_cgpa} required (your CGPA: ${Number(student.cgpa)})`;
                    }
                }

                // Backlog
                if (isEligible && p.has_backlog === false && student.has_backlog === true) {
                    isEligible = false;
                    reason = "Active backlogs not permitted for this placement";
                }

                // 10th Division
                if (isEligible && p.min_tenth_division_id !== null) {
                    if (!student.tenth_division_id || student.tenth_division_id > p.min_tenth_division_id) {
                        isEligible = false;
                        reason = "10th standard division requirement not met";
                    }
                }

                // 12th Division
                if (isEligible && p.min_twelfth_division_id !== null) {
                    if (!student.twelfth_division_id || student.twelfth_division_id > p.min_twelfth_division_id) {
                        isEligible = false;
                        reason = "12th standard division requirement not met";
                    }
                }

                // Department
                if (isEligible && p.placement_department_table.length > 0) {
                    const deptIds = p.placement_department_table.map((d) => d.department_id);
                    if (!student.department_id || !deptIds.includes(student.department_id)) {
                        isEligible = false;
                        reason = "Department / branch is not eligible";
                    }
                }

                // Semester
                if (isEligible && p.placement_semester_table.length > 0) {
                    const semIds = p.placement_semester_table.map((s) => s.semester_id);
                    if (!student.semester_id || !semIds.includes(student.semester_id)) {
                        isEligible = false;
                        reason = "Current semester is not eligible";
                    }
                }

                // Category
                if (isEligible && p.placement_category_table.length > 0) {
                    const catIds = p.placement_category_table.map((c) => c.category_id);
                    if (!student.category_id || !catIds.includes(student.category_id)) {
                        isEligible = false;
                        reason = "Category is not eligible";
                    }
                }
            } else if (!student) {
                isEligible = false;
                reason = "Student profile not found";
            }

            const canApply = isEligible && !hasApplied && !isDeadlinePassed;

            notifications.push({
                id: p.placement_id,
                notification_type: "placement",
                title: p.title,
                description: p.description,
                company_name: p.user_table?.name ?? null,
                image_url: p.image_url,
                min_cgpa: p.min_cgpa ? Number(p.min_cgpa) : null,
                salary_range: p.salary_lower && p.salary_upper ? `${p.salary_lower} - ${p.salary_upper}` : null,
                last_date_of_submission: p.last_date_of_submission,
                created_on: p.created_on,
                is_eligible: isEligible,
                eligibility_reason: reason,
                has_applied: hasApplied,
                application_status: appStatus,
                verified_by: existingApp?.verified_by ?? null,
                verified_at: existingApp?.verified_at ?? null,
                can_apply: canApply
            });
        }
    }

    if (fetchTrainings) {
        const trainings = await prisma.training_table.findMany({
            where: { is_active: true },
            include: {
                training_department_table: true,
                training_semester_table: true,
                user_table: {
                    include: {
                        organization_table: true
                    }
                },
                training_application_table: {
                    where: { student_id: data.student_id }
                }
            },
            orderBy: { created_on: 'desc' }
        });

        for (const t of trainings) {
            let isEligible = true;
            let reason = "Eligible to apply";

            const existingApp = t.training_application_table[0];
            const hasApplied = Boolean(existingApp);
            let appStatus: "Pending" | "Approved" | "Rejected" | null = null;
            if (existingApp) {
                appStatus = existingApp.status_id === 2 ? "Approved" : existingApp.status_id === 3 ? "Rejected" : "Pending";
            }

            let isDeadlinePassed = false;
            if (t.last_date_of_submission) {
                const deadline = new Date(t.last_date_of_submission);
                deadline.setHours(23, 59, 59, 999);
                if (now > deadline) {
                    isDeadlinePassed = true;
                    isEligible = false;
                    reason = "Application deadline has passed";
                }
            }

            if (student && isEligible) {
                if (t.min_cgpa !== null) {
                    if (student.cgpa === null) {
                        isEligible = false;
                        reason = `Minimum CGPA of ${t.min_cgpa} required (your CGPA is not set)`;
                    } else if (Number(student.cgpa) < Number(t.min_cgpa)) {
                        isEligible = false;
                        reason = `Minimum CGPA of ${t.min_cgpa} required (your CGPA: ${Number(student.cgpa)})`;
                    }
                }

                if (isEligible && t.training_department_table.length > 0) {
                    const deptIds = t.training_department_table.map((d) => d.department_id);
                    if (!student.department_id || !deptIds.includes(student.department_id)) {
                        isEligible = false;
                        reason = "Department / branch is not eligible";
                    }
                }

                if (isEligible && t.training_semester_table.length > 0) {
                    const semIds = t.training_semester_table.map((s) => s.semester_id);
                    if (!student.semester_id || !semIds.includes(student.semester_id)) {
                        isEligible = false;
                        reason = "Current semester is not eligible";
                    }
                }
            } else if (!student) {
                isEligible = false;
                reason = "Student profile not found";
            }

            const canApply = isEligible && !hasApplied && !isDeadlinePassed;

            notifications.push({
                id: t.training_id,
                notification_type: "training",
                title: t.title,
                description: t.description,
                company_name: t.user_table?.name ?? null,
                image_url: t.image_url,
                min_cgpa: t.min_cgpa ? Number(t.min_cgpa) : null,
                last_date_of_submission: t.last_date_of_submission,
                created_on: t.created_on,
                is_eligible: isEligible,
                eligibility_reason: reason,
                has_applied: hasApplied,
                application_status: appStatus,
                verified_by: existingApp?.verified_by ?? null,
                verified_at: existingApp?.verified_at ?? null,
                can_apply: canApply
            });
        }
    }

    // Apply filtering if requested
    let result = notifications;
    if (data.filter === "eligible") {
        result = result.filter(n => n.is_eligible);
    } else if (data.filter === "ineligible") {
        result = result.filter(n => !n.is_eligible);
    } else if (data.filter === "applied") {
        result = result.filter(n => n.has_applied);
    }

    // Sort by created_on descending
    result.sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime());

    return result;
};