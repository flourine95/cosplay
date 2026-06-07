"use client"

import { create } from "zustand"

import type { LoginInput, RegisterInput } from "@/schemas/auth"
import type { AuthUser } from "@/types/api"

interface AuthStore {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  login: (input: LoginInput) => Promise<{ error?: string }>
  register: (input: RegisterInput) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const useAuth = create<AuthStore>()((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  refresh: async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        set({ user: data.user })
      } else {
        set({ user: null })
      }
    } catch {
      set({ user: null })
    }
  },

  login: async (input) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }
    set({ user: data.user })
    return {}
  },

  register: async (input) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }
    set({ user: data.user })
    return {}
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    set({ user: null })
  },
}))
