"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { MessageCircle, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLiveRefresh } from "@/hooks/use-live-refresh"

type RentalMessage = {
  id: string
  senderId: number
  senderName: string
  content: string
  createdAt: string
}

type RentalMessageDialogProps = {
  orderNumber: string
  title?: string
  recipient?: "customer" | "seller"
  triggerLabel?: string
}

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))

export function RentalMessageDialog({
  orderNumber,
  recipient,
  title = "Tin nhắn đơn thuê",
  triggerLabel = "Nhắn tin",
}: RentalMessageDialogProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<RentalMessage[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const loadMessages = useCallback(
    async (silent = false) => {
      if (!open) return
      try {
        if (!silent) setIsLoading(true)
        const params = new URLSearchParams()
        if (recipient) params.set("recipient", recipient)
        const response = await fetch(
          `/api/rental/bookings/${orderNumber}/messages${
            params.size ? `?${params.toString()}` : ""
          }`
        )
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error ?? "Không thể lấy tin nhắn")
        }
        setMessages(json.data.messages ?? [])
        setCurrentUserId(json.data.currentUserId ?? null)
      } catch (error) {
        if (!silent) {
          toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
        }
      } finally {
        setIsLoading(false)
      }
    },
    [open, orderNumber, recipient]
  )

  useEffect(() => {
    if (!open) return
    const timeoutId = window.setTimeout(() => void loadMessages(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadMessages, open])

  useLiveRefresh({
    enabled: open && !isPending,
    intervalMs: 3000,
    onRefresh: () => loadMessages(true),
  })

  const sendMessage = () => {
    if (!content.trim()) return
    startTransition(async () => {
      const response = await fetch(
        `/api/rental/bookings/${orderNumber}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim(), recipient }),
        }
      )
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(json.error ?? "Không thể gửi tin nhắn")
        return
      }
      setMessages(json.data.messages ?? [])
      setCurrentUserId(json.data.currentUserId ?? null)
      setContent("")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageCircle className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-80 rounded-lg border border-border/60 p-4">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Đang tải tin nhắn...
            </p>
          ) : messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Chưa có tin nhắn nào.
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isMine = currentUserId === message.senderId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm ${
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-xs font-semibold opacity-80">
                        {message.senderName}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="mt-1 text-[11px] opacity-70">
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="gap-2 sm:gap-2">
          <Input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Nhập tin nhắn..."
          />
          <Button disabled={isPending || !content.trim()} onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
