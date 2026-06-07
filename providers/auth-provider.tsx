"use client"

import { useEffect } from "react"
import { useAuth } from "@/stores/auth-store"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { refresh, setLoading } = useAuth()

  useEffect(() => {
    refresh().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
