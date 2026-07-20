/**
 * status_id contract verified against backend (placement_application / training_application
 * models): 1 = Pending (default), 2 = Approved, 3 = Rejected. There is no backend state beyond
 * these three — the requested 5-state UI vocabulary (Pending/Shortlisted/Interview/Selected/
 * Rejected) doesn't exist server-side; "Shortlisted" here is a display-only label for status_id 2
 * (previously labeled inconsistently as "Approved" in some pages and "Shortlisted" in others —
 * this is the single source of truth now). Interview/Selected are not distinct persisted states.
 */
export const APPLICATION_STATUS = {
  1: { label: 'Pending', variant: 'warning' },
  2: { label: 'Shortlisted', variant: 'success' },
  3: { label: 'Rejected', variant: 'danger' },
}

export function getApplicationStatus(statusId) {
  return APPLICATION_STATUS[statusId] ?? APPLICATION_STATUS[1]
}

export default getApplicationStatus
