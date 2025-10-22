// types/user.ts
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'editor' | 'support'
  avatar_url?: string
  email_verified: boolean
  google_id?: string
  created_at?: string
  last_login?: string
  updated_at?: string
}

export interface UserListResponse {
  ok: boolean
  items: User[]
}

export interface UserResponse {
  ok?: boolean
  user: User
}

export interface AuthResponse {
  ok: boolean
  accessToken: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
}

export interface UpdateUserRequest {
  name?: string
  role?: 'admin' | 'editor' | 'support'
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface Session {
  id: number
  ip_address: string
  user_agent: string
  created_at: string
  expires_at: string
}