import { email } from "zod";
import prisma from "../../config/db.prisma.js";
import Student from "../student/student.model.js";
import type { DepartmentUpdateData, DepartmentUpdateInput } from "./department.type.js";
import type { Prisma } from "@prisma/client";


class Department {
    static async findById(department_id: number) {
        const department = await prisma.department_table.findUnique({
            where: {
                department_id
            }
        });
        return department;
    }

    static async findAll() {
        const departmentList = await prisma.department_table.findMany({
            include: {
                user_table: true
            }
        });
        return departmentList;
    }

    static async findCount() {
        const departmentCount = await prisma.department_table.count();
        return departmentCount;
    }

    static async create(departmentDataInput: {
        department_name: string,
        is_active?: boolean | undefined,
        email: string,
        password: string,
        name: string,
    }){
        const newDepartment = await prisma.$transaction(async (tx) => {
            const user = await tx.user_table.create({
                data: {
                    email: departmentDataInput.email,
                    password: departmentDataInput.password,
                    name: departmentDataInput.name,
                    role_id: 3
                }
            });

            const department = tx.department_table.create({
                data: {
                    department_name: departmentDataInput.department_name,
                    coordinator_id: user.user_id,
                    is_active: departmentDataInput.is_active ?? true
                },
                include: {
                    user_table: true
                }
            });

            return department;
        });

        return newDepartment;
    }

    static async update(department_id: number, data: DepartmentUpdateData) {                                                                                   
            const departmentData: Prisma.department_tableUpdateInput = {};                                                                         
                                                                                                                                                   
            if (data.department_name !== undefined) {                                                                                              
                departmentData.department_name = data.department_name;                                                                             
            }                                                                                                                                      
            if (data.is_active !== undefined) {                                                                                                    
                departmentData.is_active = data.is_active;                                                                                         
            }                                                                                                                                                                                                               
            const userData: Prisma.user_tableUpdateWithoutDepartment_tableInput = {};                                                              
                                                                                                                                                   
            if (data.name !== undefined) {                                                                                                         
                userData.name = data.name;                                                                                                         
            }                                                                                                                                      
            if (data.email !== undefined) {                                                                                                        
                userData.email = data.email;                                                                                                       
            }                                                                                                                                      
                                                                                                                                                                                          
            if (Object.keys(userData).length > 0) {                                                                                                
                departmentData.user_table = {                                                                                                      
                    update: userData                                                                                                               
                };                                                                                                                                 
            }                                                                                                                                      
                                                                                                                                                                                                                                                 
            const updatedDepartment = await prisma.department_table.update({                                                                       
                where: {                                                                                                                           
                    department_id: department_id                                                                                                   
                },                                                                                                                                 
                data: departmentData,                                                                                                              
                include: {                                                                                                                         
                    user_table: true                            
                }                                                                                                                                  
            });                                                                                                                                    
                                                                                                                                                   
            return updatedDepartment;    
    }

    static async getDashboard(department_id: number) {
        const studentInDepartmentCount = await Student.findCountByDepartmentId(department_id);
        const organizationCount = await prisma.organization_table.count();

        const approvedTrainingApplicationInDepartmentCount = await prisma.training_application_table.count({
            where: {
                status_id: 1,
                student_table: {
                    department_id
                }
            }
        });

        const trainingApplicationInDepartmentCount = await prisma.training_application_table.count({
            where: {
                student_table: {
                    department_id
                }
            }
        });

        const approvedPlacementApplicationInDepartmentCount = await prisma.placement_application_table.count({
            where: {
                status_id: 1,
                student_table: {
                    department_id
                }
            }
        });

        const placementApplicationInDepartmentCount = await prisma.placement_application_table.count({
            where: {
                student_table: {
                    department_id
                }
            }
        });

        return {
            studentCount: studentInDepartmentCount ?? 0,
            organizationCount: organizationCount,
            trainingApplicationCount: trainingApplicationInDepartmentCount,
            trainingPercentage: trainingApplicationInDepartmentCount > 0 ? (approvedTrainingApplicationInDepartmentCount / trainingApplicationInDepartmentCount) * 100 : 0,
            placementApplicationCount: placementApplicationInDepartmentCount,
            placementApplicationPercentage: placementApplicationInDepartmentCount > 0 ? (approvedPlacementApplicationInDepartmentCount / placementApplicationInDepartmentCount) * 100 : 0,
        }
    } 

    static async updateActiveState(department_id: number, state: "activate" | "deactivate") {
        const is_active = (state === "activate")? true : false;
        const department = await prisma.department_table.update({
            where: {
                department_id
            },
            data: {
                is_active
            }
        });
        return department;
    }

    

    // static async create(departmentData: CreateDepartmentData): Promise<IDepartment | null> {
    //     const newDepartment = await prisma.department_table.create({
    //         data: departmentData
    //     })
    // }
}

export default Department;