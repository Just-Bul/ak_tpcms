const BASE_URL = 'http://localhost:5000'

function getToken() {
  try {
    const auth = JSON.parse(localStorage.getItem('auth_user') || '{}')
    return auth?.token || auth?.user?.auth_token || auth?.data?.auth_token || ''
  } catch {
    return ''
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json()

  if (!res.ok || data.success === false) {
    const message = data?.message || data?.errors?.map(e => e.message).join(', ') || `HTTP ${res.status}`
    throw new Error(message)
  }

  return data
}

async function upload(path, fileOrFiles) {
  const token = getToken()
  const formData = fileOrFiles instanceof FormData ? fileOrFiles : new FormData()

  if (!(fileOrFiles instanceof FormData)) {
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]
    files.forEach((file) => formData.append('media', file))
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  const data = await res.json()

  if (!res.ok || data.success === false) {
    const message = data?.message || `HTTP ${res.status}`
    throw new Error(message)
  }

  return data
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload,
}

export default api
