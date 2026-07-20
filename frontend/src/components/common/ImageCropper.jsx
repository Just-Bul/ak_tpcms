import { useEffect, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Check } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui'

/**
 * Reusable crop-before-upload modal (item 17) — no external cropper dependency, just canvas.
 * Shared by Profile avatar, Company logo, and Company banner uploads. Pass `aspect` (width/height,
 * e.g. 1 for square avatars/logos, 3 for wide banners) and get a cropped Blob back via onCropped.
 */
export function ImageCropper({ open, onClose, file, aspect = 1, shape = 'round', onCropped }) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const imgRef = useRef(null)
  const dragRef = useRef(null)
  const [imgUrl, setImgUrl] = useState('')
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })

  const frameW = 280
  const frameH = frameW / aspect

  // Re-derive the object URL whenever a new file is passed in; revoke the old one to avoid leaks.
  useEffect(() => {
    if (!file) {
      setImgUrl('')
      return
    }
    const url = URL.createObjectURL(file)
    setImgUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onImgLoad = (e) => {
    setNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const onPointerDown = (e) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: offset }
  }
  const onPointerMove = (e) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setOffset({ x: dragRef.current.origin.x + dx, y: dragRef.current.origin.y + dy })
  }
  const onPointerUp = () => {
    dragRef.current = null
  }

  const handleConfirm = () => {
    if (!imgRef.current) return
    const displayScale = Math.max(frameW / naturalSize.w, frameH / naturalSize.h) * zoom
    const canvas = document.createElement('canvas')
    const outW = aspect >= 1 ? 800 : Math.round(800 * aspect)
    const outH = Math.round(outW / aspect)
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')

    const scaleFactor = outW / frameW
    const drawW = naturalSize.w * displayScale * scaleFactor
    const drawH = naturalSize.h * displayScale * scaleFactor
    const drawX = outW / 2 - drawW / 2 + offset.x * scaleFactor
    const drawY = outH / 2 - drawH / 2 + offset.y * scaleFactor

    ctx.drawImage(imgRef.current, drawX, drawY, drawW, drawH)
    canvas.toBlob(
      (blob) => {
        if (blob) onCropped(blob)
        handleClose()
      },
      'image/jpeg',
      0.92
    )
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Adjust Image" size="sm">
      <div className="space-y-4">
        <div
          className="relative mx-auto overflow-hidden bg-black/40 border border-orbit-border cursor-move select-none"
          style={{ width: frameW, height: frameH, borderRadius: shape === 'round' ? '9999px' : '0.75rem' }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
        >
          {imgUrl && (
            <img
              ref={imgRef}
              src={imgUrl}
              onLoad={onImgLoad}
              alt="Crop preview"
              draggable={false}
              className="absolute top-1/2 left-1/2 max-w-none pointer-events-none"
              style={{
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                width: naturalSize.w >= naturalSize.h ? 'auto' : frameW,
                height: naturalSize.w >= naturalSize.h ? frameH : 'auto',
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <ZoomOut size={16} className="text-slate-500" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-orbit-primary"
          />
          <ZoomIn size={16} className="text-slate-500" />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button icon={<Check size={15} />} onClick={handleConfirm}>Apply</Button>
        </div>
      </div>
    </Modal>
  )
}

export default ImageCropper
