import api from './api'

/**
 * Student Document Repository API
 *
 * Uses existing backend routes:
 *   POST   /students/documents            — create document record
 *   GET    /students/documents/me          — student's own docs
 *   GET    /students/:user_id/documents    — docs by user_id (admin/coordinator)
 *   DELETE /students/documents/:id         — delete document
 *   PATCH  /students/documents/:id/verify  — verify document
 *
 * File upload uses:
 *   POST   /uploads/document              — upload file, returns { fileUrl }
 */

export async function uploadDocumentFile(file) {
  const res = await api.upload('/uploads/document', file)
  return res?.fileUrl || res?.data?.fileUrl || ''
}

export async function createStudentDocument({ user_id, document_type, document_name, document_url }) {
  const body = { document_type, document_name, document_url }
  if (user_id) body.user_id = user_id
  const res = await api.post('/students/documents', body)
  return res?.data || res
}

export async function fetchMyDocuments() {
  const res = await api.get('/students/documents/me')
  return Array.isArray(res?.data) ? res.data : []
}

export async function fetchStudentDocuments(userId) {
  const res = await api.get(`/students/${userId}/documents`)
  return Array.isArray(res?.data) ? res.data : []
}

export async function deleteStudentDocument(documentId) {
  return api.delete(`/students/documents/${documentId}`)
}

export async function verifyStudentDocument(documentId, verified = true) {
  const res = await api.patch(`/students/documents/${documentId}/verify`, { verified })
  return res?.data || res
}
