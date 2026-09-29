import api from "./api";
import { check } from "./check";

/* ============================================================
   NORMALIZE DATA
============================================================ */

const normalizeOrganization = (organization) => ({
  ...organization,

  name:
    organization.name ||
    organization.user_table?.name ||
    "",

  email:
    organization.email ||
    organization.user_table?.email ||
    "",

  mobile_no:
    organization.mobile_no ||
    organization.user_table?.mobile_no ||
    "",

  remarks:
    organization.remarks || "",

  document_url:
    organization.document_url || "",
});

const normalizeOrganizations = (organizations = []) =>
  organizations.map(normalizeOrganization);

/* ============================================================
   GET ORGANIZATIONS
============================================================ */

/**
 * Pending Companies
 */

export async function fetchPendingOrganizations() {
  const res = await api.get(
    "/organizations?status=pending"
  );

  return normalizeOrganizations(
    check(res).data || []
  );
}

/**
 * Approved Companies
 */

export async function fetchApprovedOrganizations() {
  const res = await api.get(
    "/organizations?status=approved"
  );

  return normalizeOrganizations(
    check(res).data || []
  );
}

/**
 * Rejected Companies
 */

export async function fetchRejectedOrganizations() {
  const res = await api.get(
    "/organizations?status=rejected"
  );

  return normalizeOrganizations(
    check(res).data || []
  );
}

/* ============================================================
   APPROVE ORGANIZATION
============================================================ */

export async function approveOrganization(userId) {
  const res = await api.patch(
    `/organizations/${userId}/status`,
    {
      approval_id: 2,
    }
  );

  return check(res).data;
}

/* ============================================================
   REJECT ORGANIZATION
============================================================ */

export async function rejectOrganization(
  userId,
  remarks
) {
  const res = await api.patch(
    `/organizations/${userId}/status`,
    {
      approval_id: 3,
      remarks,
    }
  );

  return check(res).data;
}

/* ============================================================
   OPTIONAL HELPERS
============================================================ */

/**
 * Reload companies by status
 */

export async function fetchOrganizations(status) {
  switch (status) {
    case "approved":
      return fetchApprovedOrganizations();

    case "rejected":
      return fetchRejectedOrganizations();

    case "pending":
    default:
      return fetchPendingOrganizations();
  }
}

/**
 * All organizations regardless of approval status, used for the "Disabled Companies" list.
 * DELETE /organizations/:id?status=activate|deactivate toggles is_active.
 */
export async function fetchAllOrganizations() {
  const res = await api.get("/organizations?status=all");
  return normalizeOrganizations(check(res).data || []);
}

export async function setOrganizationActiveState(organizationId, active) {
  const res = await api.delete(
    `/organizations/${organizationId}?status=${active ? "activate" : "deactivate"}`
  );
  return check(res).data;
}
