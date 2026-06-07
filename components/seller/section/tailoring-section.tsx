"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { tailoringOrders } from "../seller-data"
import {
  CheckCircle2,
  Circle,
  Clock,
  Ruler,
  Image as ImageIcon,
  MessageSquare,
  Send,
} from "lucide-react"

export type TailoringOrder = {
  id: string
  status: string
  item: string
  customer: string
  note: string
  measurements: Record<string, string | number>
  references?: string[]
  timeline?: Array<{ label: string; done: boolean }>
  changeRequests?: Array<{ time: string; text: string }>
}

export function TailoringSectionNew() {
  const [selectedOrder, setSelectedOrder] = useState<TailoringOrder | null>(
    tailoringOrders[0] ?? null
  )
  const [replyText, setReplyText] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Chờ báo giá":
        return "bg-amber-500/10 text-amber-700 border-amber-200"
      case "Đang gia công":
        return "bg-sky-500/10 text-sky-700 border-sky-200"
      case "Yêu cầu chỉnh sửa":
        return "bg-purple-500/10 text-purple-700 border-purple-200"
      case "Hoàn thành":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getProgress = (timeline?: Array<{ label: string; done: boolean }>) => {
    if (!timeline) return 0
    const completed = timeline.filter((t) => t.done).length
    return (completed / timeline.length) * 100
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Orders List */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Danh sách yêu cầu</CardTitle>
          <p className="text-sm text-muted-foreground">
            {tailoringOrders.length} đơn đặt may
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {tailoringOrders.map((order: TailoringOrder) => {
            const isSelected = selectedOrder?.id === order.id
            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full cursor-pointer rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:bg-muted/50 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border/60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {order.customer.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {order.id}
                      </p>
                      <p className="font-semibold text-foreground">
                        {order.customer}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(order.status)}
                  >
                    {order.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {order.item}
                </p>
                {order.timeline && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-medium text-primary">
                        {getProgress(order.timeline).toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={getProgress(order.timeline)}
                      className="h-1.5"
                    />
                  </div>
                )}
              </button>
            )
          })}
        </CardContent>
      </Card>

      {/* Order Details */}
      {selectedOrder ? (
        <div className="space-y-6">
          {/* Header */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{selectedOrder.item}</CardTitle>
                    <Badge
                      variant="outline"
                      className={getStatusColor(selectedOrder.status)}
                    >
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Đơn {selectedOrder.id} · Khách hàng:{" "}
                    {selectedOrder.customer}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedOrder.status === "Chờ báo giá" && (
                    <Button size="sm">Gửi báo giá</Button>
                  )}
                  {selectedOrder.status === "Đang gia công" && (
                    <Button size="sm" variant="outline">
                      Cập nhật tiến độ
                    </Button>
                  )}
                  {selectedOrder.status === "Yêu cầu chỉnh sửa" && (
                    <Button size="sm">Xác nhận chỉnh sửa</Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">
                  Ghi chú từ khách hàng:
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedOrder.note}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Measurements */}
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Ruler className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Số đo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(selectedOrder.measurements).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
                      >
                        <span className="text-sm text-muted-foreground">
                          {key}
                        </span>
                        <span className="font-semibold text-foreground">
                          {value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* References */}
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-sky-500/10 p-2">
                    <ImageIcon className="h-4 w-4 text-sky-600" />
                  </div>
                  <CardTitle className="text-base">
                    Hình ảnh tham khảo
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {selectedOrder.references &&
                selectedOrder.references.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedOrder.references.map((ref, idx) => (
                      <div
                        key={idx}
                        className="aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ref}
                          alt={`Reference ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      Chưa có hình ảnh tham khảo
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          {selectedOrder.timeline && (
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-purple-500/10 p-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-base">Tiến độ gia công</CardTitle>
                </div>
                <Progress
                  value={getProgress(selectedOrder.timeline)}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 rounded-full p-1 ${
                          step.done ? "bg-emerald-500/10" : "bg-muted"
                        }`}
                      >
                        {step.done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            step.done
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Change Requests */}
          {selectedOrder.changeRequests &&
            selectedOrder.changeRequests.length > 0 && (
              <Card className="border-amber-200 border-border/60 bg-amber-500/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-amber-500/10 p-2">
                      <MessageSquare className="h-4 w-4 text-amber-600" />
                    </div>
                    <CardTitle className="text-base">
                      Yêu cầu chỉnh sửa
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.changeRequests.map((request, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-amber-200 bg-background p-4"
                      >
                        <p className="text-sm text-foreground">
                          {request.text}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {request.time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="Nhập phản hồi cho khách hàng..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button size="sm" className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Gửi phản hồi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      ) : (
        <Card className="flex h-[600px] items-center justify-center border-border/60">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground">
              Chọn một đơn đặt may
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Chọn đơn từ danh sách bên trái để xem chi tiết
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
