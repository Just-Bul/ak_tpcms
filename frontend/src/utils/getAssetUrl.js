const BASE_URL = 'http://localhost:5000'

/** Resolves a possibly-relative backend asset path (image_url, resume_url, etc.) to an absolute URL. */
export function getAssetUrl(path) {
  if (!path) return ''
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export default getAssetUrl
