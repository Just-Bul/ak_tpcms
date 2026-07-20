import { getOneOrganizationService, getOrganizationsService, registerOrganizationService, updateOrganizationActiveStateService, updateOrganizationStatusService } from "./organization.service.js";
import type { Request, Response, NextFunction } from "express";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import type { OrganizationIdParamInput, OrganizationRegisterInput, OrganizationUpdateActiveStateInput } from "./organization.type.js";
import User from "../user/user.model.js";
import prisma from "../../config/db.prisma.js";
import ApiError from "../../utils/ApiError.js";
import Role from "../role/role.model.js";

export const registerOrganizationController = async (
    req: Request<{}, {}, OrganizationRegisterInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const newOrganization = await registerOrganizationService(req.body, req.user as UserJwtPayload);
        res.status(201).json({
            success: true,
            message: `Organization with email: ${req.body.email} created`,
            data: newOrganization
        });
    } catch (error) {
        next(error);
    }
}

export const updateOrganizationStatusController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { organization_id } = req.params as any;
        const { approval_id,  remarks } = req.body;
        const updatedOrganization = await updateOrganizationStatusService({organization_id: Number(organization_id), approval_id, remarks}, req.user as UserJwtPayload);
        res.status(200).json({
            success: true,
            message: `Successfully updated organization approval status`,
            data: updatedOrganization
        });
    } catch (error) {
        next(error);
    }
}

export const getOrganizationsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { status } = req.query as any;
        const organizationList = await getOrganizationsService(status);
        const sanitizedOrganizationList = organizationList.map((organization) => {
            const {password, ...userTable} = organization.user_table;
            return {
                ...organization,
                user_table: userTable
            }
        });
        res.status(200).json({
            success: true,
            message: "Successfully fetched organizations",
            data: sanitizedOrganizationList
        });
    } catch (error) {
        next(error);
    }
}

export const getOneOrganizationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const organization_id = (req.params as OrganizationIdParamInput).organization_id;
        const organization = await getOneOrganizationService(organization_id);
        res.status(200).json({
            success: true,
            message: "Successfully fetched organization details",
            data: organization
        });
    } catch (error) {
        next(error);
    }
}

export const updateOrganizationActiveStateController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { organization_id } = req.params as unknown as OrganizationUpdateActiveStateInput['params'];
        const { status } = req.query as unknown as OrganizationUpdateActiveStateInput['query'];
        const organization = await updateOrganizationActiveStateService(organization_id, status);
        res.status(200).json({
            success: true,
            message: "Successfully updated organization state",
            data: organization
        });
    } catch (error) {
        next(error);
    }
}

export const updateOrganizationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const actor = req.user as UserJwtPayload;
        const organization_id = Number(req.params.organization_id);

        if (actor.auth_user_id !== organization_id && actor.auth_role_id !== Role.SuperAdmin) {
            throw new ApiError(403, "You are not authorized to update this profile");
        }

        const { name, email, mobile_no, sector_id } = req.body;

        const updatedUser = await User.update(organization_id, {
            name,
            email,
            mobile_no
        });

        const updateData: any = {};
        if (sector_id !== undefined) {
            updateData.sector_id = sector_id ? Number(sector_id) : null;
        }

        const updatedOrg = await prisma.organization_table.update({
            where: { user_id: organization_id },
            data: updateData,
            include: {
                user_table: {
                    select: {
                        user_id: true,
                        name: true,
                        email: true,
                        mobile_no: true
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Organization profile updated successfully",
            data: updatedOrg
        });
    } catch (error) {
        next(error);
    }
}