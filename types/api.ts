import type { User } from "@/app/generated/prisma/client"

export type ApiResponse<T = unknown> = {
  data?: T
  error?: string
  message?: string
}

export type ApiError = {
  error: string
  status?: number
}

export type ApiSuccess<T = unknown> = {
  data: T
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/** User object trả về từ API — không có password */
export type UserPublic = Omit<User, "password">

/** Alias dùng trong auth store và client components */
export type AuthUser = UserPublic
