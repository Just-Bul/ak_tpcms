import { useEffect, useState } from 'react'
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  Plus,
  Loader2,
  ShieldCheck,
  ShieldX,
} from 'lucide-react'

import { Button, Badge, Input, Select } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import {
  uploadDocumentFile,
  createStudentDocument,
  fetchStudentDocuments,
  fetchMyDocuments,
  deleteStudentDocument,
  verifyStudentDocument,
} from '@/services/studentDocuments'
import { getAssetUrl } from '@/utils/getAssetUrl'

const DOCUMENT_TYPES = [
  'ID Card',
  'Marksheet',
  'Grade Card',
  'Certificate',
  'Recommendation Letter',
  'Photo',
  'Resume',
  'Other',
]

export function StudentDocumentsPanel({ studentId, readonly = false }) {
  const { role } = useAuth()
  const isSelf = !studentId
  const isAdmin = role === 'Super Admin' || role === 'Coordinator'

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /* Upload form state */
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [docType, setDocType] = useState('Certificate')
  const [docName, setDocName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  /* Load documents */
  const loadDocuments = async () => {
    try {
      setLoading(true)
      setError('')
      const docs = isSelf
        ? await fetchMyDocuments()
        : await fetchStudentDocuments(studentId)
      setDocuments(docs)
    } catch (err) {
      setError(err?.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId])

  /* Upload handler */
  const handleUpload = async () => {
    if (!selectedFile || !docName.trim()) {
      setUploadError('Please select a file and enter a document name')
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      const fileUrl = await uploadDocumentFile(selectedFile)
      if (!fileUrl) throw new Error('Upload failed — no file URL returned')

      await createStudentDocument({
        user_id: studentId || undefined,
        document_type: docType,
        document_name: docName.trim(),
        document_url: fileUrl,
      })

      setShowUpload(false)
      setSelectedFile(null)
      setDocName('')
      setDocType('Certificate')
      await loadDocuments()
    } catch (err) {
      setUploadError(err?.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  /* Delete handler */
  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return
    try {
      await deleteStudentDocument(docId)
      await loadDocuments()
    } catch (err) {
      alert(err?.message || 'Failed to delete document')
    }
  }

  /* Verify handler (admin only) */
  const handleVerify = async (docId, verified) => {
    try {
      await verifyStudentDocument(docId, verified)
      await loadDocuments()
    } catch (err) {
      alert(err?.message || 'Failed to update verification')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
        <Loader2 className="animate-spin" size={16} />
        Loading documents...
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-orbit-danger py-4">{error}</p>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-orbit-text-primary flex items-center gap-2">
          <FileText size={15} />
          Documents ({documents.length})
        </h4>
        {!readonly && (
          <Button
            size="xs"
            variant="outline"
            icon={<Plus size={13} />}
            onClick={() => setShowUpload(!showUpload)}
          >
            {showUpload ? 'Cancel' : 'Upload'}
          </Button>
        )}
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="rounded-xl border border-orbit-border bg-orbit-surface2/40 p-4 space-y-3">
          {uploadError && (
            <p className="text-xs text-orbit-danger">{uploadError}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Document Name"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Semester 6 Marksheet"
              required
            />
            <Select
              label="Document Type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-600 bg-orbit-surface px-4 py-3 text-sm text-slate-400 hover:border-orbit-primary hover:text-orbit-primary-light transition-colors">
                <Upload size={16} />
                {selectedFile ? selectedFile.name : 'Choose file...'}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </label>
            <Button
              size="sm"
              loading={uploading}
              disabled={!selectedFile || !docName.trim()}
              icon={<Upload size={14} />}
              onClick={handleUpload}
            >
              Upload
            </Button>
          </div>
        </div>
      )}

      {/* Documents list */}
      {documents.length === 0 ? (
        <div className="py-8 text-center">
          <FileText size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-500">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.document_id}
              className="flex items-center gap-3 rounded-xl border border-orbit-border bg-orbit-surface2/40 px-4 py-3"
            >
              <div className="w-8 h-8 rounded-lg bg-orbit-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-orbit-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-orbit-text-primary truncate">
                  {doc.document_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="neutral">{doc.document_type}</Badge>
                  {doc.verified ? (
                    <Badge variant="success">
                      <CheckCircle2 size={10} className="mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <XCircle size={10} className="mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {doc.document_url && (
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={<Download size={13} />}
                    onClick={() =>
                      window.open(
                        getAssetUrl(doc.document_url),
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                  />
                )}

                {isAdmin && (
                  <>
                    {!doc.verified ? (
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={<ShieldCheck size={13} />}
                        className="text-emerald-400 hover:text-emerald-300"
                        onClick={() => handleVerify(doc.document_id, true)}
                        title="Verify"
                      />
                    ) : (
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={<ShieldX size={13} />}
                        className="text-amber-400 hover:text-amber-300"
                        onClick={() => handleVerify(doc.document_id, false)}
                        title="Unverify"
                      />
                    )}
                  </>
                )}

                {!readonly && (
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={<Trash2 size={13} />}
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(doc.document_id)}
                    title="Delete"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentDocumentsPanel
