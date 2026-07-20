import api from './api'
import { check } from './check'
import { sortByNewest } from '@/utils/sortByNewest'

export async function fetchAllNotes() {
  const res = await api.get('/notes')
  return sortByNewest(check(res).data || [])
}

/** Notices created by the current logged-in Coordinator/SuperAdmin/Organization user. */
export async function fetchMyNotes() {
  const res = await api.get('/notes/me')
  return sortByNewest(check(res).data || [])
}

export async function fetchNote(noteId) {
  const res = await api.get(`/notes/${noteId}`)
  return check(res).data
}

export async function createNote(payload) {
  const res = await api.post('/notes', payload)
  return check(res).data
}

export default { fetchAllNotes, fetchMyNotes, fetchNote, createNote }
