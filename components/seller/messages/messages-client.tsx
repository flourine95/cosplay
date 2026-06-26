"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Send } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type Conversation = {
  id: string
  customer: { id: number; name: string; avatar: string | null }
  orderId: number | null
  customOrderId: number | null
  rentalOrderId: number | null
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  messages: {
    id: string
    senderId: number
    content: string
    isRead: boolean
    createdAt: string
  }[]
}

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))

export function SellerMessagesClient() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/seller/messages")
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? "Không thể lấy tin nhắn")
      setConversations(json.data)
      setSelectedConversationId(
        (current) => current ?? json.data[0]?.id ?? null
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadMessages(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadMessages])

  const filteredConversations = useMemo(
    () =>
      conversations.filter((conversation) =>
        conversation.customer.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [conversations, searchQuery]
  )
  const selectedConversation =
    conversations.find(
      (conversation) => conversation.id === selectedConversationId
    ) ?? null

  async function sendMessage() {
    if (!selectedConversation || !messageInput.trim()) return
    setIsSending(true)
    try {
      const response = await fetch("/api/seller/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: messageInput.trim(),
        }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? "Không thể gửi tin nhắn")
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === json.data.id ? json.data : conversation
        )
      )
      setMessageInput("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading)
    return <Skeleton className="h-[calc(100vh-240px)] rounded-xl" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tin nhắn
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trao đổi với khách hàng về đơn hàng và yêu cầu đặt may
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="flex h-[calc(100vh-240px)] flex-col overflow-hidden border-border/60">
          <div className="border-b border-border/60 p-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khách hàng..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Chưa có cuộc trò chuyện nào.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`flex w-full gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${
                      selectedConversationId === conversation.id
                        ? "bg-muted"
                        : "bg-background"
                    }`}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage
                        src={conversation.customer.avatar ?? undefined}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conversation.customer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold">
                          {conversation.customer.name}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <div className="mb-1 flex gap-1.5">
                        {conversation.orderId && (
                          <Badge variant="outline">
                            ORD-{conversation.orderId}
                          </Badge>
                        )}
                        {conversation.customOrderId && (
                          <Badge variant="outline">
                            TAIL-{conversation.customOrderId}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-muted-foreground">
                          {conversation.lastMessage || "Chưa có tin nhắn"}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="h-5 min-w-5 rounded-full px-1.5 text-[10px]">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        <Card className="flex h-[calc(100vh-240px)] flex-col overflow-hidden border-border/60">
          {selectedConversation ? (
            <>
              <div className="flex items-center justify-between border-b border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedConversation.customer.avatar ?? undefined}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedConversation.customer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {selectedConversation.customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.messages.length} tin nhắn
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                      Chưa có tin nhắn trong cuộc trò chuyện này.
                    </div>
                  ) : (
                    selectedConversation.messages.map((message) => {
                      const isSeller =
                        message.senderId !== selectedConversation.customer.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isSeller ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[72%] rounded-2xl px-4 py-2.5 ${
                              isSeller
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">
                              {message.content}
                            </p>
                            <p className="mt-1 text-[11px] opacity-75">
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  void sendMessage()
                }}
                className="flex items-end gap-2 border-t border-border/60 p-4"
              >
                <Input
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  placeholder="Nhập tin nhắn..."
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSending || !messageInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">
                  Chọn một cuộc trò chuyện
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Danh sách bên trái sẽ hiển thị khi có khách nhắn tin.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
