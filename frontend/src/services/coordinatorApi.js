import api from "./api";
import { check } from "./check";

const COORDINATOR_ROLE_ID = 3;

// GET all coordinators
export async function fetchCoordinators() {
  const res = await api.get("/users");

  const users = check(res).data || [];

  return users.filter(
    (user) =>
      user.role_id === COORDINATOR_ROLE_ID ||
      user.role?.role_id === COORDINATOR_ROLE_ID ||
      user.role?.role_name === "T&P"
  );
}

// GET single coordinator
export async function fetchCoordinator(userId) {
  const res = await api.get(`/users/${userId}`);
  return check(res).data;
}

// CREATE coordinator
export async function createCoordinator(payload) {
  const res = await api.post("/users/register", {
    ...payload,
    role_id: COORDINATOR_ROLE_ID,
  });

  return check(res).data;
}

// UPDATE coordinator
export async function updateCoordinator(userId, payload) {
  const res = await api.put(`/users/${userId}`, payload);
  return check(res).data;
}

// DELETE / Disable coordinator
export async function deleteCoordinator(userId) {
  const res = await api.put(`/users/${userId}`, {
    is_active: false,
  });

  return check(res).data;
}

export async function fetchDepartments() {
  const res = await api.get("/departments");
  return check(res).data || [];
}

export async function fetchGenders() {
  const res = await api.get("/genders");
  return check(res).data || [];
}
