import api from './api'
import { check } from './check'
import { sortByNewest } from '@/utils/sortByNewest'

export async function fetchTrainings() {
  const res = await api.get('/trainings')
  return sortByNewest(check(res).data || [])
}

export async function fetchTraining(trainingId) {
  const res = await api.get(`/trainings/${trainingId}`)
  return check(res).data
}

export async function createTraining(payload) {
  const res = await api.post('/trainings', payload)
  return check(res).data
}

export async function disableTraining(trainingId) {
  const res = await api.delete(`/trainings/${trainingId}`)
  return check(res).data
}

export default { fetchTrainings, fetchTraining, createTraining, disableTraining }
