"use client"

import { create } from "zustand"
import type { AuthUser } from "@/types/api"

interface AuthStore {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    agreed: boolean,
    role?: "CUSTOMER" | "SELLER"
  ) => Promise<{ error?: string }>
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

  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }
    set({ user: data.user })
    return {}
  },

  register: async (
    name,
    email,
    password,
    confirmPassword,
    agreed,
    role = "CUSTOMER"
  ) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        confirmPassword,
        agreed,
        role,
      }),
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
