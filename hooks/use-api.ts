// hooks/use-api.ts
import { useAuth } from "@/lib/auth-provider"
import { apiClient } from "@/lib/api-client"
import { useCallback } from "react"

export function useAPI() {
  const { refreshAccessToken } = useAuth()

  const fetchAPI = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    // Ensure we have a valid token
    const token = await refreshAccessToken()
    
    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await apiClient(endpoint, options)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || error.message || 'Request failed')
    }

    return response.json()
  }, [refreshAccessToken])

  const get = useCallback(
    async <T = any>(endpoint: string): Promise<T> => {
      return fetchAPI(endpoint, { method: 'GET' })
    },
    [fetchAPI]
  )

  const post = useCallback(
    async <T = any>(endpoint: string, data?: any): Promise<T> => {
      return fetchAPI(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      })
    },
    [fetchAPI]
  )

  const put = useCallback(
    async <T = any>(endpoint: string, data?: any): Promise<T> => {
      return fetchAPI(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      })
    },
    [fetchAPI]
  )

  const del = useCallback(
    async <T = any>(endpoint: string): Promise<T> => {
      return fetchAPI(endpoint, { method: 'DELETE' })
    },
    [fetchAPI]
  )

  return { get, post, put, delete: del, fetchAPI }
}