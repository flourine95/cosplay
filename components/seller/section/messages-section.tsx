"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Archive,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import {
  conversations,
  messagesByConversation,
  type Conversation,
} from "../seller-data"

export function MessagesSectionNew() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(conversations[0] ?? null)
  const [searchQuery, setSearchQuery] = useState("")
  const [messageInput, setMessageInput] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentMessages = selectedConversation
    ? messagesByConversation[selectedConversation.id] || []
    : []

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Mock sending - in real app would call API
      setMessageInput("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tin nhắn
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trao đổi với khách hàng về đơn hàng và yêu cầu đặt may
        </p>
      </div>

      {/* Messages Layout */}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Conversations List */}
        <Card className="flex h-[calc(100vh-240px)] flex-col overflow-hidden border-border/60">
          {/* Search */}
          <div className="border-b border-border/60 p-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/60">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex w-full gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${
                    selectedConversation?.id === conv.id
                      ? "bg-muted"
                      : "bg-background"
                  }`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={conv.customerAvatar} />
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {conv.customerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {conv.customerName}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    {conv.orderId && (
                      <div className="mb-1 flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="h-5 text-[10px] font-medium"
                        >
                          {conv.orderId}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {conv.orderType}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge
                          variant="default"
                          className="h-5 min-w-[20px] rounded-full px-1.5 text-[10px]"
                        >
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        {selectedConversation ? (
          <Card className="flex h-[calc(100vh-240px)] flex-col overflow-hidden border-border/60">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border/60 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.customerAvatar} />
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {selectedConversation.customerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedConversation.customerName}
                  </p>
                  {selectedConversation.orderId && (
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="h-5 text-[10px] font-medium"
                      >
                        {selectedConversation.orderId}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {selectedConversation.orderType}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    Lưu trữ
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa cuộc trò chuyện
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentMessages.map((msg) => {
                  const isSeller = msg.senderId === "SELLER"
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isSeller ? "flex-row-reverse" : ""}`}
                    >
                      {!isSeller && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={msg.senderAvatar} />
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {msg.senderName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`flex max-w-[70%] flex-col gap-1 ${isSeller ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            isSeller
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">
                            {msg.content}
                          </p>

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((attachment, idx) => (
                                <div key={idx}>
                                  {attachment.type === "image" && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={attachment.url}
                                      alt={attachment.name || "Attachment"}
                                      className="max-h-48 rounded-lg"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-xs text-muted-foreground ${!msg.isRead && !isSeller ? "font-medium" : ""}`}
                        >
                          {msg.timestamp}
                          {!msg.isRead && !isSeller && " • Chưa đọc"}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border/60 p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-end gap-2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <div className="flex-1">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="icon"
                  disabled={!messageInput.trim()}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        ) : (
          <Card className="flex h-[calc(100vh-240px)] items-center justify-center border-border/60">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-muted p-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">
                Chọn một cuộc trò chuyện
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Chọn khách hàng từ danh sách bên trái để bắt đầu
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
