import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data)
    
    // Don't auto-redirect, let components handle it
    if (error.response?.status === 401) {
      // Just log it, don't redirect here
      console.log('Authentication failed')
    }
    return Promise.reject(error)
  }
)

export default api