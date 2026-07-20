import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { ImageCropper } from '@/components/common/ImageCropper'
import { cn } from '@/utils/cn'
import api from '@/services/api'

/**
 * Single reusable avatar/logo/banner upload control (items 16, 17): one image, a small
 * edit/upload icon overlay, and the shared ImageCropper — instead of the separate,
 * duplicated upload dropzones previously hand-built per page (Settings, ProfileView,
 * StudentProfileSetup, CompanyProfile, CompanyProfileSetup).
 */
export function AvatarUpload({
  value,
  onChange,
  uploadPath,
  initials = '?',
  size = '2xl',
  shape = 'round',
  aspect = 1,
  className,
}) {
  const inputRef = useRef(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingFile(file)
      setCropperOpen(true)
    }
    e.target.value = ''
  }

  const handleCropped = async (blob) => {
    setUploading(true)
    try {
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })
      const result = await api.upload(uploadPath, file)
      onChange(result.fileUrl)
    } catch (err) {
      alert(err.message || 'Failed to upload image.')
    } finally {
      setUploading(false)
      setPendingFile(null)
    }
  }

  const isBanner = shape !== 'round'

  return (
    <div className={cn('relative inline-block', className)}>
      {isBanner ? (
        <div className="h-32 w-full max-w-xs rounded-xl overflow-hidden border border-orbit-border bg-orbit-surface2 flex items-center justify-center">
          {value ? (
            <img src={value} alt="Banner" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-slate-500">No banner set</span>
          )}
        </div>
      ) : (
        <Avatar src={value} initials={initials} size={size} />
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-orbit-primary text-white shadow-lg hover:bg-orbit-primary-light disabled:opacity-60"
        title="Change image"
      >
        {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
      </button>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />

      <ImageCropper
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        file={pendingFile}
        aspect={aspect}
        shape={shape}
        onCropped={handleCropped}
      />
    </div>
  )
}

export default AvatarUpload
