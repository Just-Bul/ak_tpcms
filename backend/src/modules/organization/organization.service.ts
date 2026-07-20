import Organization from "./organization.model.js";
import PasswordManager from "../../utils/password.util.js";
import ApiError from "../../utils/ApiError.js";
import type { UserJwtPayload } from "../../utils/jwt.util.js";
import type { IOrganization, OrganizationRegisterInput, OrganizationUpdateData } from "./organization.type.js";
import User from "../user/user.model.js";

export const registerOrganizationService = async (input: OrganizationRegisterInput, actor: UserJwtPayload) => {
    const existingUser = await User.findByEmail(input.email);
    if (existingUser) {
        throw new ApiError(409, "This email is already exists");
    }

    input.password = await PasswordManager.hashPassword(input.password);
    const newOganization = await Organization.create({
        name: input.name,
        email: input.email,
        mobile_no: input.mobile_no,
        password: input.password,
        sector_id: input.sector_id ?? null
    });

    if (!newOganization) {
        throw new Error;
    }

    return newOganization;
}

export const updateOrganizationStatusService = async (data: {organization_id: number, approval_id: number, remarks?: string | undefined}, actor: UserJwtPayload) => {
    const existingUser = await User.findByEmail(actor.auth_email);
    if (!existingUser) {
        throw new ApiError(404, "User does not exist");
    } 

    const existingOrganization = await Organization.findById(data.organization_id);
    if (!existingOrganization) {
        throw new ApiError(404, "Organization does not exist");
    }

    const organizationData: OrganizationUpdateData = {
        remarks: data.remarks ?? null,
        approval_id: data.approval_id
    }
    const organization = await Organization.update(data.organization_id, organizationData);
    if (!organization) {
        throw new ApiError(500, "Failed to update organization status");
    }

    return organization;
}

export const getOrganizationsService = async (status?: "approved" | "pending" | "rejected" | "all") => {
    let organizationList = null;
    if (status === "pending") {
        organizationList = await Organization.findPending();
    } else if (status === "rejected") {
        organizationList = await Organization.findRejected();
    } else if (status === "all") {
        organizationList = await Organization.findAll();
    } else {
        organizationList = await Organization.findApproved();
    }

    if (!organizationList) {
        throw new ApiError(500, "Could not fetch organization list");
    }
    return organizationList;
}

export const getOneOrganizationService = async (organization_id: number) => {
    const organization = await Organization.findById(organization_id);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }
    return organization;
}

export const updateOrganizationActiveStateService = async (organization_id: number, status: "activate" | "deactivate") => {
    const organization = await Organization.updateActiveState(organization_id, status);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }
    return organization;
}
