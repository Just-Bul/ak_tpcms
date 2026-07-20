import api from "./api";
import { check } from "./check";

/* =====================================================
   GET ALL DEPARTMENTS
===================================================== */

export async function fetchDepartments() {
  const res = await api.get("/departments/");

  return check(res).data || [];
}

/* =====================================================
   GET SINGLE DEPARTMENT
===================================================== */

export async function fetchDepartment(departmentId) {
  const departments = await fetchDepartments();

  const department = departments.find(
    (d) =>
      Number(d.department_id) === Number(departmentId)
  );

  if (!department) {
    throw new Error("Department not found.");
  }

  return department;
}

/* =====================================================
   CREATE DEPARTMENT
===================================================== */

export async function createDepartment(payload) {
  const res = await api.post(
    "/departments/register",
    payload
  );

  return check(res).data;
}

/* =====================================================
   UPDATE DEPARTMENT
===================================================== */

export async function updateDepartment(
  departmentId,
  payload
) {
  const res = await api.patch(
    `/departments/${departmentId}`,
    payload
  );

  return check(res).data;
}

/* =====================================================
   ACTIVATE / DEACTIVATE DEPARTMENT
===================================================== */

export async function setDepartmentActiveState(departmentId, active) {
  const res = await api.delete(
    `/departments/${departmentId}?status=${active ? "activate" : "deactivate"}`
  );

  return check(res).data;
}
