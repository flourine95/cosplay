import { supabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface Message {
  id: string
  conversationId: string
  senderId: number
  content: string
  attachments: string[]
  isRead: boolean
  readAt: string | null
  createdAt: string
}

/**
 * Hook để subscribe realtime messages trong một conversation
 *
 * @example
 * const { messages } = useRealtimeMessages(conversationId);
 */
export function useRealtimeMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!conversationId) return

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          )
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  return { messages }
}
