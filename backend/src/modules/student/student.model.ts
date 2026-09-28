import prisma from "../../config/db.prisma.js";
import type { Prisma } from "@prisma/client";
import Data from "../../utils/data.util.js";
import type { StudentCreateData, StudentUpdateData } from "./student.type.js";
import Role from "../role/role.model.js";

class Student {
    static async findById(user_id: number) {
        const student = await prisma.student_table.findUnique({
            where: {user_id},
            include: {
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
                division_table_student_table_twelfth_division_idTodivision_table: true
            }
        });
        return student;
    }

    static async findByEmail(email: string) {
        const student =  await prisma.student_table.findFirst({
            where: {
                user_table: {
                    email
                }
            },
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
                gender_table: true,
                category_table: true,
                semester_table: true,
                
                division_table_student_table_tenth_division_idTodivision_table: true,
                division_table_student_table_twelfth_division_idTodivision_table: true
            }
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

            const newStudent = await tx.student_table.create({
                data: {
                    user_id: newUser.user_id,
                    roll_no: studentData.roll_no,
                    department_id: studentData.department_id ?? null,
                    semester_id: studentData.semester_id ?? null
                }
            });

            return newStudent;
        });
        return newStudent
    }
    static async findCount(): Promise<number> {
        const studentCount = await prisma.student_table.count();
        return studentCount;
    }

    static async findAll() {
        const studentList = await prisma.student_table.findMany({
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
                department_table: true,
                category_table: true,
                gender_table: true,
                semester_table: true,
                division_table_student_table_tenth_division_idTodivision_table: true,
                division_table_student_table_twelfth_division_idTodivision_table: true,
                student_skill_table: true
            }
        });
        return studentList;
    }

    static async update(user_id: number, updateData: StudentUpdateData, skills: string[]) {                                                    
            const userData: Prisma.user_tableUncheckedUpdateInput = Data.filterUndefined({                                                         
                email: updateData.email,                                                                                                           
                mobile_no: updateData.mobile_no,                                                                                                   
                name: updateData.name                                                                                                              
            });                                                                                                                                    
                                                                                                                                                   
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
                date_of_birth: updateData.date_of_birth                                                                                            
            });                                                                                                                                    
                                                                                                                                                   
            const student = await prisma.$transaction(async (tx) => {                                                                              
                if (skills && skills.length > 0) {                                                                                                 
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
                                                                                                                                                   
                if (Object.keys(userData).length > 0) {
                    await tx.user_table.update({
                        where: { user_id },
                        data: userData
                    });
                }

                return await tx.student_table.update({
                    where: { user_id },
                    data: studentData,
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
                        }
                    }
                });                                                                                                                                
            });                                                                                                                                    
                                                                                                                                                   
            return student;                                                                                                                        
        }               

    static async updateAdmin(user_id: number, updateData: StudentUpdateData) {
        const userData: Prisma.user_tableUpdateInput = Data.filterUndefined({
            email: updateData.email,
            mobile_no: updateData.mobile_no,
            name: updateData.name
        });

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
            is_graduate: updateData.is_graduate,
        });

        return await prisma.$transaction(async (tx)=> {
            const user = await tx.user_table.update({
                where: {
                    user_id: user_id,
                },
                data: userData
            });
            
            const student = await tx.student_table.update({
                where: {
                    user_id: user.user_id
                },
                data: studentData,
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
                    }
                }
            });

            return student;
        })
    }

    static async findCountByDepartmentId(department_id: number): Promise<number> {
        const studentCount = await prisma.student_table.count({
            where: {
                department_id
            }
        });
        return studentCount;
    }

    static async findByCoordinatorId(coordinator_id: number) {
        const studentList = await prisma.student_table.findMany({
            where: {
                department_table: {
                    coordinator_id
                }
            },
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
                gender_table: true,
                category_table: true,
                semester_table: true,
                department_table: true,
                
                division_table_student_table_tenth_division_idTodivision_table: true,
                division_table_student_table_twelfth_division_idTodivision_table: true
            }
        });
        return studentList;
    }

    static async findByDepartmentId(department_id: number) {
        const studentList =  await prisma.student_table.findMany({
            where: {
                department_id
            },
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
                gender_table: true,
                category_table: true,
                semester_table: true,
                department_table: true,
                
                division_table_student_table_tenth_division_idTodivision_table: true,
                division_table_student_table_twelfth_division_idTodivision_table: true
            }
        });
        return studentList;
    }
}

export default Student;