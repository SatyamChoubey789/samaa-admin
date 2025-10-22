// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.samaabysiblings.com/backend'

/**
 * API client with automatic token refresh
 * This should be used with a token refresh function from AuthProvider
 */
export async function apiClient(
  endpoint: string,
  options: RequestInit = {},
  getToken?: () => Promise<string | null>
): Promise<Response> {
  const url = `${API_URL}${endpoint}`

  // Add authorization header if token exists
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Merge existing headers
  if (options.headers) {
    const existingHeaders = new Headers(options.headers)
    existingHeaders.forEach((value, key) => {
      headers[key] = value
    })
  }

  // Get fresh token if available
  let token: string | null = null
  if (getToken) {
    token = await getToken()
  }

  // Add authorization if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Make request
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Always include cookies for refresh token
  })

  return response
}

/**
 * Typed API client methods factory
 * Returns API methods bound to a token refresh function
 */
export function createApiClient(getToken: () => Promise<string | null>) {
  return {
    get: async <T>(endpoint: string): Promise<T> => {
      const response = await apiClient(endpoint, { method: 'GET' }, getToken)
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(error.error || 'Request failed')
      }
      return response.json()
    },

    post: async <T>(endpoint: string, data?: any): Promise<T> => {
      const response = await apiClient(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }, getToken)
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(error.error || 'Request failed')
      }
      return response.json()
    },

    put: async <T>(endpoint: string, data?: any): Promise<T> => {
      const response = await apiClient(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }, getToken)
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(error.error || 'Request failed')
      }
      return response.json()
    },

    delete: async <T>(endpoint: string): Promise<T> => {
      const response = await apiClient(endpoint, { method: 'DELETE' }, getToken)
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(error.error || 'Request failed')
      }
      return response.json()
    },
  }
}