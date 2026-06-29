"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import Image from "next/image"
import { toast } from "sonner"
import {
  CheckCircle,
  PackageCheck,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RentalMessageDialog } from "@/components/rental/rental-message-dialog"
import { useLiveRefresh } from "@/hooks/use-live-refresh"
import { formatCurrency } from "@/lib/format"

type SellerRentalOrder = {
  id: string
  orderNumber: string
  rawStatus: string
  statusLabel: string
  itemName: string
  customerName: string
  customerPhone: string | null
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  shippingDistrict: string
  shippingWard: string
  shippingNote: string | null
  returnName: string
  returnPhone: string
  returnAddress: string
  returnCity: string
  returnDistrict: string
  returnWard: string
  returnAddressNote: string | null
  startDate: string
  endDate: string
  totalDays: number
  totalPrice: number
  deposit: number
  lateFee: number
  damageFee: number
  refundAmount: number
  pickupImages: string[]
  returnImages: string[]
  returnNotes: string | null
  latestDispute: {
    id: number
    status: string
    statusLabel: string
    reason: string
    description: string
    shopResponse: string | null
    adminNote: string | null
    refundAmount: number | null
  } | null
}

const statusTone: Record<string, string> = {
  DEPOSIT_PAID: "bg-sky-500/10 text-sky-700",
  CONFIRMED: "bg-amber-500/10 text-amber-700",
  READY_FOR_PICKUP: "bg-indigo-500/10 text-indigo-700",
  RENTED: "bg-purple-500/10 text-purple-700",
  RETURNED: "bg-orange-500/10 text-orange-700",
  DEPOSIT_REFUNDED: "bg-emerald-500/10 text-emerald-700",
  COMPLETED: "bg-emerald-500/10 text-emerald-700",
  CANCELLED: "bg-rose-500/10 text-rose-700",
  OVERDUE: "bg-rose-500/10 text-rose-700",
}

export function RentalOrderManagement() {
  const [orders, setOrders] = useState<SellerRentalOrder[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<SellerRentalOrder | null>(null)
  const [damageFee, setDamageFee] = useState("0")
  const [damageDescription, setDamageDescription] = useState("")
  const [conditionAtReturn, setConditionAtReturn] = useState("EXCELLENT")
  const [disputeResponse, setDisputeResponse] = useState("")
  const [isPending, startTransition] = useTransition()

  const loadOrders = useCallback(async (silent = false) => {
    try {
      const response = await fetch("/api/seller/rental-orders")
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? "Không thể tải đơn thuê")
      setOrders(json.data ?? [])
    } catch (error) {
      if (!silent) {
        toast.error(error instanceof Error ? error.message : "Co loi xay ra")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrders()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadOrders])

  useLiveRefresh({
    enabled: !isLoading && !isPending,
    intervalMs: 4000,
    onRefresh: () => loadOrders(true),
  })

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return orders
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(normalized) ||
        order.itemName.toLowerCase().includes(normalized) ||
        order.customerName.toLowerCase().includes(normalized)
    )
  }, [orders, query])

  function runAction(order: SellerRentalOrder, action: string, body = {}) {
    startTransition(async () => {
      const response = await fetch(
        `/api/seller/rental-orders/${order.orderNumber}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...body }),
        }
      )
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(json.error ?? "Không thể cập nhật đơn thuê")
        return
      }
      toast.success("Đã cập nhật đơn thuê")
      await loadOrders()
      setSelected(null)
    })
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Đang tải đơn thuê...</p>
  }

  return (
    <div className="space-y-5">
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm mã đơn, khách hàng hoặc tên trang phục..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Chưa có đơn thuê phù hợp.
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.orderNumber} className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {order.orderNumber}
                    </p>
                    <CardTitle className="mt-1 text-lg">
                      {order.itemName}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.customerName} ·{" "}
                      {order.customerPhone ?? "Chưa có SĐT"} · {order.startDate}{" "}
                      - {order.endDate}
                    </p>
                  </div>
                  <Badge className={statusTone[order.rawStatus] ?? ""}>
                    {order.statusLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm md:grid-cols-4">
                  <Info
                    label="Phí thuê"
                    value={formatCurrency(order.totalPrice)}
                  />
                  <Info label="Cọc" value={formatCurrency(order.deposit)} />
                  <Info label="Phí trễ" value={formatCurrency(order.lateFee)} />
                  <Info
                    label="Hoàn cọc"
                    value={formatCurrency(order.refundAmount)}
                  />
                </div>

                {order.returnNotes && (
                  <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    Ghi chú trả đồ: {order.returnNotes}
                  </p>
                )}

                <div className="rounded-lg border border-border/60 p-3 text-sm">
                  <p className="font-semibold">Địa chỉ giao hàng</p>
                  <p className="mt-1 text-muted-foreground">
                    {order.shippingName} - {order.shippingPhone}
                  </p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress}, {order.shippingWard},{" "}
                    {order.shippingDistrict}, {order.shippingCity}
                  </p>
                  {order.shippingNote && (
                    <p className="mt-1 text-muted-foreground">
                      Ghi chú: {order.shippingNote}
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-border/60 p-3 text-sm">
                  <p className="font-semibold">Địa chỉ khách trả đồ về shop</p>
                  <p className="mt-1 text-muted-foreground">
                    {order.returnName} - {order.returnPhone}
                  </p>
                  <p className="text-muted-foreground">
                    {order.returnAddress}, {order.returnWard},{" "}
                    {order.returnDistrict}, {order.returnCity}
                  </p>
                  {order.returnAddressNote && (
                    <p className="mt-1 text-muted-foreground">
                      Ghi chú: {order.returnAddressNote}
                    </p>
                  )}
                </div>

                {(order.pickupImages.length > 0 ||
                  order.returnImages.length > 0) && (
                  <div className="grid gap-3 rounded-lg border border-border/60 p-3 text-sm md:grid-cols-2">
                    <EvidencePreview
                      label="Ảnh khách gửi khi nhận đồ"
                      images={order.pickupImages}
                    />
                    <EvidencePreview
                      label="Ảnh khách gửi trước khi trả"
                      images={order.returnImages}
                    />
                  </div>
                )}

                {order.latestDispute && (
                  <div className="rounded-lg border border-destructive/30 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">
                        Khiếu nại: {order.latestDispute.reason}
                      </p>
                      <Badge variant="destructive">
                        {order.latestDispute.statusLabel}
                      </Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {order.latestDispute.description}
                    </p>
                    {order.latestDispute.shopResponse && (
                      <p className="mt-2 text-muted-foreground">
                        Phản hồi shop: {order.latestDispute.shopResponse}
                      </p>
                    )}
                    {order.latestDispute.adminNote && (
                      <p className="mt-2 font-medium">
                        Phán quyết admin: {order.latestDispute.adminNote}
                      </p>
                    )}
                    {order.latestDispute.refundAmount !== null && (
                      <p className="mt-1 text-muted-foreground">
                        Hoàn cho khách theo phán quyết:{" "}
                        {formatCurrency(order.latestDispute.refundAmount)}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <RentalMessageDialog
                    orderNumber={order.orderNumber}
                    title={`Tin nhắn với khách - ${order.orderNumber}`}
                    triggerLabel="Nhắn tin khách"
                  />
                  {order.rawStatus === "DEPOSIT_PAID" && (
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => runAction(order, "confirm")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Xác nhận đơn
                    </Button>
                  )}
                  {["DEPOSIT_PAID", "CONFIRMED"].includes(order.rawStatus) && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => runAction(order, "markReady")}
                    >
                      <PackageCheck className="mr-2 h-4 w-4" />
                      Sẵn sàng giao
                    </Button>
                  )}
                  {["DEPOSIT_PAID", "CONFIRMED", "READY_FOR_PICKUP"].includes(
                    order.rawStatus
                  ) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => runAction(order, "cancel")}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Hủy đơn
                    </Button>
                  )}
                  {order.rawStatus === "RETURNED" && (
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => {
                        setSelected(order)
                        setDamageFee(String(order.damageFee))
                        setDamageDescription("")
                        setConditionAtReturn("EXCELLENT")
                      }}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Kiểm tra đồ trả
                    </Button>
                  )}
                  {order.latestDispute?.status === "OPEN" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => {
                        setSelected(order)
                        setDisputeResponse("")
                      }}
                    >
                      Phản hồi khiếu nại
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selected?.rawStatus === "RETURNED"
                ? "Kiểm tra đồ trả"
                : "Phản hồi khiếu nại"}
            </DialogTitle>
          </DialogHeader>
          {selected?.rawStatus === "RETURNED" ? (
            <div className="space-y-4">
              <Select
                value={conditionAtReturn}
                onValueChange={setConditionAtReturn}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tình trạng đồ khi trả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXCELLENT">Rất tốt</SelectItem>
                  <SelectItem value="GOOD">Tốt</SelectItem>
                  <SelectItem value="FAIR">Cần vệ sinh/sửa nhẹ</SelectItem>
                  <SelectItem value="DAMAGED">Hư hỏng</SelectItem>
                </SelectContent>
              </Select>
              Phí tổn thất trang phục
              <Input
                type="number"
                min={0}
                value={damageFee}
                onChange={(event) => setDamageFee(event.target.value)}
                placeholder="Phí hư hỏng"
              />
              <Textarea
                value={damageDescription}
                onChange={(event) => setDamageDescription(event.target.value)}
                placeholder="Mô tả tình trạng đồ, phụ kiện thiếu/hỏng nếu có..."
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Hủy
                </Button>
                <Button
                  disabled={isPending || !selected}
                  onClick={() =>
                    selected &&
                    runAction(selected, "inspectReturn", {
                      conditionAtReturn,
                      damageFee: Number(damageFee || 0),
                      damageDescription,
                    })
                  }
                >
                  Lưu kết quả
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={disputeResponse}
                onChange={(event) => setDisputeResponse(event.target.value)}
                placeholder="Nhập phản hồi và bằng chứng của shop..."
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Hủy
                </Button>
                <Button
                  disabled={isPending || !selected || !disputeResponse.trim()}
                  onClick={() =>
                    selected?.latestDispute &&
                    runAction(selected, "respondDispute", {
                      disputeId: selected.latestDispute.id,
                      response: disputeResponse,
                    })
                  }
                >
                  Gửi phản hồi
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}

function EvidencePreview({
  images,
  label,
}: {
  images: string[]
  label: string
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        {label}
      </p>
      {images.length === 0 ? (
        <p className="text-xs text-muted-foreground">Chưa có ảnh</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {images.slice(0, 5).map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="relative block h-16 w-16 overflow-hidden rounded-md border border-border bg-muted"
            >
              <Image src={url} alt={label} fill className="object-cover" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
