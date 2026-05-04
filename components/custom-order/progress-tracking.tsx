"use client"

import React, { useState } from "react"
import {
  CheckCircle2,
  Clock,
  Package,
  Send,
  Edit3,
  Image as ImageIcon,
  ChevronRight,
  CheckCircle,
  Banknote,
  MessageCircle,
  Download,
  AlertCircle,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"
import Link from "next/link"
import { useParams } from "next/navigation"

const timelineSteps = [
  {
    id: 1,
    label: "Đã xác nhận & Nhận cọc",
    date: "15/04/2026 – 10:00",
    desc: "Đã nhận cọc 1,000,000 đ.",
    done: true,
  },
  {
    id: 2,
    label: "Chuẩn bị vật liệu",
    date: "16/04/2026",
    desc: "Maker đã chốt rập và mua đủ vải.",
    done: true,
  },
  {
    id: 3,
    label: "Đang gia công",
    date: "Hiện tại",
    desc: "Đang lên form thử áo, may chi tiết phụ kiện.",
    done: false,
    current: true,
  },
  {
    id: 4,
    label: "Hoàn thiện & Nghiệm thu",
    date: "Dự kiến 20/05/2026",
    desc: "",
    done: false,
  },
  {
    id: 5,
    label: "Thanh toán & Giao hàng",
    date: "Sau nghiệm thu",
    desc: "",
    done: false,
  },
]

const messages = [
  {
    id: 1,
    sender: "seller",
    name: "Klee Crafter Shop",
    avatar: "KC",
    time: "Hôm qua, 14:20",
    text: "Mình vừa lên form thử cái áo trong, bạn xem vải này ánh kim lên ok không nhé. Tay áo mình làm rộng 20cm như bạn dặn rồi.",
    images: ["Áo_lót_form.jpg", "Chi_tiết_vai.jpg"],
    isWip: true,
  },
  {
    id: 2,
    sender: "buyer",
    name: "Bạn",
    avatar: "ME",
    time: "Hôm qua, 16:05",
    text: "Vải lên đẹp quá shop ơi! Chốt form này nhé. Nhưng mình muốn phần cổ áo cao thêm 1cm nữa được không?",
    images: [],
    isWip: false,
  },
  {
    id: 3,
    sender: "seller",
    name: "Klee Crafter Shop",
    avatar: "KC",
    time: "Hôm qua, 16:30",
    text: "Ok bạn ơi, mình sẽ điều chỉnh ngay. Dự kiến cuối tuần này sẽ có ảnh update tiếp nhé.",
    images: [],
    isWip: false,
  },
]

export function ProgressTracking() {
  const params = useParams()
  const orderId = params.id ? `#CM-${params.id}` : "#CM-40912"
  const [revisionText, setRevisionText] = useState("")
  const [message, setMessage] = useState("")
  const progressPercent = 60

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href="/custom-order"
              className="transition-colors hover:text-foreground"
            >
              Đặt may
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">{orderId}</span>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Theo dõi Tiến độ Gia công
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Genshin Impact – Raiden Shogun Full Set • Maker:{" "}
                <span className="font-medium text-primary">
                  Klee Crafter Shop
                </span>
              </p>
            </div>
            <Badge className="w-fit bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
              🔧 Đang gia công ({progressPercent}%)
            </Badge>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Tiến độ tổng thể</span>
              <span className="font-semibold text-primary">
                {progressPercent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cột trái */}
          <div className="space-y-5">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Banknote className="h-4 w-4 text-primary" />
                  Thông tin đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                {[
                  { label: "Mã đơn", value: orderId, cls: "" },
                  {
                    label: "Ngân sách chốt",
                    value: "2,500,000 đ",
                    cls: "font-bold text-primary",
                  },
                  { label: "Đã cọc", value: "1,000,000 đ", cls: "" },
                  {
                    label: "Còn lại",
                    value: "1,500,000 đ",
                    cls: "font-semibold text-orange-600",
                  },
                  { label: "Deadline", value: "20/05/2026", cls: "" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={item.cls || "font-medium"}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-primary" />
                  Cột mốc tiến độ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timelineSteps.map((step, i) => (
                  <div key={step.id} className="flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          step.done
                            ? "border-green-500 bg-green-500 text-white"
                            : step.current
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {step.done ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : step.current ? (
                          <Clock className="h-3.5 w-3.5" />
                        ) : (
                          <Package className="h-3.5 w-3.5" />
                        )}
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <div
                          className={`mt-1 w-px ${step.done ? "bg-green-400" : "bg-border"}`}
                          style={{ height: 28 }}
                        />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <p
                        className={`text-sm font-semibold ${step.current ? "text-primary" : step.done ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.date}
                      </p>
                      {step.desc && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {step.desc}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/60 shadow-sm dark:border-green-900 dark:bg-green-950/20">
              <CardContent className="space-y-3 pt-5 pb-4">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                  ✅ Nghiệm thu sản phẩm
                </p>
                <p className="text-xs text-muted-foreground">
                  Khi Maker gửi ảnh hoàn thiện, bấm để xác nhận đạt yêu cầu và
                  chuyển sang thanh toán phần còn lại.
                </p>
                <Button disabled className="w-full" variant="outline">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Nghiệm thu sản phẩm
                </Button>
                <p className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  Chờ Maker gửi ảnh hoàn thiện
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cột phải: Chat WIP */}
          <div className="flex flex-col lg:col-span-2" style={{ height: 580 }}>
            <Card className="flex flex-1 flex-col overflow-hidden border-border/60 shadow-sm">
              <CardHeader className="shrink-0 border-b bg-muted/20 px-4 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Trao đổi & Hình ảnh tiến độ (WIP)
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Tải tất cả ảnh
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-6">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.sender === "buyer" ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback
                            className={`text-xs ${msg.sender === "buyer" ? "bg-primary text-primary-foreground" : ""}`}
                          >
                            {msg.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`flex max-w-[75%] flex-col gap-2 ${msg.sender === "buyer" ? "items-end" : ""}`}
                        >
                          <div
                            className={`rounded-2xl p-3 text-sm ${
                              msg.sender === "buyer"
                                ? "rounded-tr-none bg-primary text-primary-foreground"
                                : "rounded-tl-none bg-muted"
                            }`}
                          >
                            <p
                              className={`mb-1 text-xs font-semibold ${msg.sender === "buyer" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                            >
                              {msg.name} • {msg.time}
                            </p>
                            {msg.text}
                          </div>
                          {msg.images.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {msg.images.map((img) => (
                                <div
                                  key={img}
                                  className="relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-border bg-muted transition-colors hover:border-primary/50"
                                >
                                  <ImageIcon className="h-7 w-7 text-muted-foreground opacity-30" />
                                  <span className="absolute right-0 bottom-1.5 left-0 mx-1 truncate rounded bg-background/80 px-1 text-center text-[10px] font-semibold">
                                    {img}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {msg.isWip && msg.sender === "seller" && (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-200 text-xs text-green-600 hover:bg-green-50 hover:text-green-700"
                              >
                                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                Duyệt tiến độ này
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-destructive/30 text-xs text-destructive hover:bg-destructive/10"
                                  >
                                    <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                                    Yêu cầu chỉnh sửa
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Yêu cầu Chỉnh sửa (Revisions)
                                    </DialogTitle>
                                    <DialogDescription>
                                      Ghi rõ điểm chưa ưng ý. Chỉnh sửa lớn có
                                      thể ảnh hưởng chi phí và deadline.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    value={revisionText}
                                    onChange={(e) =>
                                      setRevisionText(e.target.value)
                                    }
                                    placeholder="VD: Tay áo hơi ngắn, mình muốn dài qua mu bàn tay. Phần viền cổ áo dùng kim tuyến nhạt hơn..."
                                    className="min-h-[100px] resize-none"
                                  />
                                  <DialogFooter>
                                    <Button variant="ghost">Hủy</Button>
                                    <Button className="bg-destructive text-white hover:bg-destructive/90">
                                      <Edit3 className="mr-1.5 h-4 w-4" />
                                      Gửi Yêu cầu Sửa
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>

              <Separator />
              <CardFooter className="shrink-0 p-3">
                <form
                  className="flex w-full items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (message.trim()) {
                      setMessage("")
                    }
                  }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                  >
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nhắn tin với Maker..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0"
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
