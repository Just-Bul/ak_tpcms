import { useRef, useState } from 'react'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'
import { readFileAsDataUrl, isImageFile, isPdfFile } from '@/utils/fileUpload'
import api from '@/services/api'

export default function MediaUpload({
  label = 'Upload file',
  accept = 'image/*,application/pdf',
  value = '',
  onChange,
  hint = 'Image or PDF, max 2 MB',
  uploadPath = '',
}) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFile = async (file) => {
    setError('')
    setLoading(true)
    try {
      if (uploadPath) {
        const result = await api.upload(uploadPath, file)
        onChange?.(result.fileUrl, file)
      } else {
        const dataUrl = await readFileAsDataUrl(file)
        onChange?.(dataUrl, file)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const previewIsImage =
    value?.startsWith('data:image') || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(value)
  const previewIsPdf =
    value?.startsWith('data:application/pdf') || /\.pdf($|\?)/i.test(value)

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-medium text-slate-400">{label}</label>
      )}
      <div className="flex flex-wrap items-start gap-3">
        {value ? (
          <div className="relative rounded-lg border border-orbit-border bg-orbit-surface2 p-2">
            {previewIsImage ? (
              <img src={value} alt="Preview" className="h-24 w-24 rounded-md object-cover" />
            ) : previewIsPdf ? (
              <div className="flex h-24 w-24 items-center justify-center rounded-md bg-red-500/10">
                <FileText className="h-8 w-8 text-red-400" />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-md bg-orbit-primary/10">
                <ImageIcon className="h-8 w-8 text-orbit-primary-light" />
              </div>
            )}
            <button
              type="button"
              onClick={() => onChange?.('')}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : null}
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-24 min-w-[140px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-orbit-border px-4 py-3 text-slate-400 hover:border-orbit-primary hover:text-slate-200"
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs">{loading ? 'Uploading...' : 'Choose file'}</span>
        </button>
      </div>
      {hint && <p className="text-[11px] text-slate-600">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && (isImageFile(file) || isPdfFile(file) || accept.includes('*'))) {
            handleFile(file)
          } else if (file) {
            setError('Only image or PDF files are allowed')
          }
          e.target.value = ''
        }}
      />
    </div>
  )
}
