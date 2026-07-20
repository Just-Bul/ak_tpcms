import api from './api'
import { check } from './check'
import { sortByNewest } from '@/utils/sortByNewest'

/** Placement applications */

export async function fetchPlacementApplications() {
  const res = await api.get('/placement-applications')
  return sortByNewest(check(res).data || [])
}

export async function fetchPlacementApplication(placementId, studentId) {
  const res = await api.get(`/placement-applications/${placementId}/students/${studentId}`)
  return check(res).data
}

export async function applyToPlacement(payload) {
  const res = await api.post('/placement-applications', payload)
  return check(res).data
}

/** status: "Rejected" (any other value approves) — matches backend's binary approve/reject contract. */
export async function updatePlacementApplicationStatus(placementId, studentId, status) {
  const res = await api.patch(`/placement-applications/${placementId}/students/${studentId}/status`, { status })
  return check(res).data
}

export async function approvePlacementApplication(placementId, studentId) {
  return updatePlacementApplicationStatus(placementId, studentId, 'Approved')
}

export async function rejectPlacementApplication(placementId, studentId) {
  return updatePlacementApplicationStatus(placementId, studentId, 'Rejected')
}

/** Training applications */

export async function fetchTrainingApplications() {
  const res = await api.get('/training-applications')
  return sortByNewest(check(res).data || [])
}

export async function fetchTrainingApplication(trainingId, studentId) {
  const res = await api.get(`/training-applications/${trainingId}/students/${studentId}`)
  return check(res).data
}

export async function applyToTraining(payload) {
  const res = await api.post('/training-applications', payload)
  return check(res).data
}

/** status is a query param ("approve"|"reject") per backend's zod enum — unlike placement's body-based status. */
export async function updateTrainingApplicationStatus(trainingId, studentId, status, remarks) {
  const res = await api.patch(
    `/training-applications/${trainingId}/students/${studentId}?status=${status}`,
    remarks !== undefined ? { remarks } : {}
  )
  return check(res).data
}

export async function approveTrainingApplication(trainingId, studentId, remarks) {
  return updateTrainingApplicationStatus(trainingId, studentId, 'approve', remarks)
}

export async function rejectTrainingApplication(trainingId, studentId, remarks) {
  return updateTrainingApplicationStatus(trainingId, studentId, 'reject', remarks)
}

export default {
  fetchPlacementApplications,
  fetchPlacementApplication,
  applyToPlacement,
  updatePlacementApplicationStatus,
  approvePlacementApplication,
  rejectPlacementApplication,
  fetchTrainingApplications,
  fetchTrainingApplication,
  applyToTraining,
  updateTrainingApplicationStatus,
  approveTrainingApplication,
  rejectTrainingApplication,
}
