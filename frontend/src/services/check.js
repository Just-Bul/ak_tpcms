/** Shared response-normalizer/error-thrower, matching the pattern already used in organizationApi.js/departmentApi.js/coordinatorApi.js. */
export function check(response) {
  if (!response) throw new Error('No response from server.')

  if (response.success === false) {
    let message = 'Request failed'
    if (Array.isArray(response.errors)) {
      message = response.errors.map((e) => e.message || e).join(', ')
    } else if (typeof response.errors === 'string') {
      message = response.errors
    } else if (typeof response.message === 'string') {
      message = response.message
    }
    throw new Error(message)
  }

  return response
}

export default check
