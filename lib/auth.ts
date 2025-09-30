import api from "./api"

export interface User {
  user: User
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/api/v1/auth/login", credentials)
    return response.data
  },

  register: async (credentials: RegisterCredentials) => {
    const response = await api.post("/api/v1/auth/register", credentials)
    return response.data
  },

  logout: async () => {
    const response = await api.post("/api/v1/auth/logout")
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get("/api/v1/auth/profile", { withCredentials: true })
    return response.data.user || response.data
  },
}
