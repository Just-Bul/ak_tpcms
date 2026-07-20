import api from './api'
import { check } from './check'
import { sortByNewest } from '@/utils/sortByNewest'

export async function fetchPlacements() {
  const res = await api.get('/placements')
  return sortByNewest(check(res).data || [])
}

export async function fetchPlacement(placementId) {
  const res = await api.get(`/placements/${placementId}`)
  return check(res).data
}

export async function createPlacement(payload) {
  const res = await api.post('/placements', payload)
  return check(res).data
}

export default { fetchPlacements, fetchPlacement, createPlacement }
