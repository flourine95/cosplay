"use client"

import { useEffect, useRef } from "react"

type UseLiveRefreshOptions = {
  enabled?: boolean
  intervalMs?: number
  onRefresh: () => Promise<void> | void
}

export function useLiveRefresh({
  enabled = true,
  intervalMs = 5000,
  onRefresh,
}: UseLiveRefreshOptions) {
  const refreshRef = useRef(onRefresh)
  const runningRef = useRef(false)

  useEffect(() => {
    refreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    if (!enabled) return

    let timeoutId: number | null = null
    let isDisposed = false

    const runRefresh = async () => {
      if (
        isDisposed ||
        runningRef.current ||
        document.visibilityState === "hidden"
      ) {
        return
      }

      runningRef.current = true
      try {
        await refreshRef.current()
      } finally {
        runningRef.current = false
      }
    }

    const schedule = () => {
      timeoutId = window.setTimeout(async () => {
        await runRefresh()
        if (!isDisposed) schedule()
      }, intervalMs)
    }

    const handleVisible = () => {
      if (document.visibilityState === "visible") void runRefresh()
    }

    const handleFocus = () => {
      void runRefresh()
    }

    document.addEventListener("visibilitychange", handleVisible)
    window.addEventListener("focus", handleFocus)
    schedule()

    return () => {
      isDisposed = true
      if (timeoutId !== null) window.clearTimeout(timeoutId)
      document.removeEventListener("visibilitychange", handleVisible)
      window.removeEventListener("focus", handleFocus)
    }
  }, [enabled, intervalMs])
}
