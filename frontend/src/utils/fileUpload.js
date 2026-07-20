const MAX_BYTES = 2 * 1024 * 1024

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'))
      return
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('File must be under 2 MB'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function isImageFile(file) {
  return file?.type?.startsWith('image/')
}

export function isPdfFile(file) {
  return file?.type === 'application/pdf'
}
