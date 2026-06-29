"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { ReturnReason, ReturnStatus } from "@/app/generated/prisma/enums"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

export type AdminDisputeRow = {
  id: number
  orderNumber: string
  customer: string
  customerEmail: string
  seller: string
  sellerEmail: string
  itemSummary: string
  orderTotal: number
  paymentStatus: string
  escrowStatus: string
  orderStatus: string
  payoutStatus: string | null
  reason: ReturnReason
  description: string
  images: string[]
  videos: string[]
  status: ReturnStatus
  adminNote: string | null
  refundAmount: number | null
  createdAt: string
  resolvedAt: string | null
}

type DisputeManagementProps = {
  disputes: AdminDisputeRow[]
}

const statusLabels: Record<ReturnStatus, string> = {
  [ReturnStatus.PENDING]: "Chờ admin xử lý",
  [ReturnStatus.APPROVED]: "Đã duyệt trả hàng",
  [ReturnStatus.REJECTED]: "Từ chối",
  [ReturnStatus.SHIPPING_BACK]: "Đang gửi trả",
  [ReturnStatus.RECEIVED]: "Đã nhận hàng trả",
  [ReturnStatus.REFUNDED]: "Đã hoàn tiền",
  [ReturnStatus.CLOSED]: "Đã đóng",
}

const reasonLabels: Record<ReturnReason, string> = {
  [ReturnReason.WRONG_ITEM]: "Sai sản phẩm",
  [ReturnReason.DAMAGED]: "Hư hỏng",
  [ReturnReason.NOT_AS_DESCRIBED]: "Không đúng mô tả",
  [ReturnReason.MISSING_PARTS]: "Thiếu phụ kiện",
  [ReturnReason.OTHER]: "Khác",
}

const statusVariants: Record<
  ReturnStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [ReturnStatus.PENDING]: "secondary",
  [ReturnStatus.APPROVED]: "outline",
  [ReturnStatus.REJECTED]: "destructive",
  [ReturnStatus.SHIPPING_BACK]: "outline",
  [ReturnStatus.RECEIVED]: "outline",
  [ReturnStatus.REFUNDED]: "default",
  [ReturnStatus.CLOSED]: "secondary",
}

const resolvedStatuses = new Set<ReturnStatus>([
  ReturnStatus.REJECTED,
  ReturnStatus.REFUNDED,
  ReturnStatus.CLOSED,
])

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))

export function DisputeManagement({ disputes }: DisputeManagementProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>("all")
  const [selected, setSelected] = useState<AdminDisputeRow | null>(null)
  const [nextStatus, setNextStatus] = useState<ReturnStatus>(
    ReturnStatus.APPROVED
  )
  const [adminNote, setAdminNote] = useState("")
  const [refundAmount, setRefundAmount] = useState("")
  const [isPending, startTransition] = useTransition()

  const filteredDisputes = useMemo(() => {
    if (filter === "all") return disputes
    return disputes.filter((dispute) => dispute.status === filter)
  }, [disputes, filter])

  const pendingCount = disputes.filter(
    (dispute) => dispute.status === ReturnStatus.PENDING
  ).length
  const refundedAmount = disputes.reduce(
    (sum, dispute) => sum + (dispute.refundAmount ?? 0),
    0
  )
  const blockedPayoutCount = disputes.filter(
    (dispute) => !resolvedStatuses.has(dispute.status)
  ).length

  const openDialog = (dispute: AdminDisputeRow) => {
    setSelected(dispute)
    setNextStatus(dispute.status)
    setAdminNote(dispute.adminNote ?? "")
    setRefundAmount(
      dispute.refundAmount
        ? String(dispute.refundAmount)
        : String(dispute.orderTotal)
    )
  }

  const updateDispute = () => {
    if (!selected) return

    startTransition(async () => {
      const res = await fetch(`/api/admin/disputes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          adminNote,
          refundAmount:
            nextStatus === ReturnStatus.REFUNDED
              ? Number(refundAmount || selected.orderTotal)
              : undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? "Không thể cập nhật dispute")
        return
      }

      toast.success("Đã cập nhật dispute")
      setSelected(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Return / Refund / Dispute
        </h1>
        <p className="text-sm text-muted-foreground">
          Xử lý yêu cầu trả hàng, hoàn tiền và tranh chấp giữa buyer với seller.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chờ xử lý
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang giữ payout
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{blockedPayoutCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã hoàn
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(refundedAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Danh sách dispute</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.values(ReturnStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Escrow</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisputes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Chưa có dispute phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDisputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-semibold">
                      {dispute.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{dispute.customer}</div>
                      <div className="text-xs text-muted-foreground">
                        {dispute.customerEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{dispute.seller}</div>
                      <div className="text-xs text-muted-foreground">
                        {dispute.sellerEmail}
                      </div>
                    </TableCell>
                    <TableCell>{reasonLabels[dispute.reason]}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(dispute.orderTotal)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{dispute.escrowStatus}</div>
                      {dispute.payoutStatus && (
                        <div className="text-xs text-muted-foreground">
                          Payout: {dispute.payoutStatus}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[dispute.status]}>
                        {statusLabels[dispute.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(dispute.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(dispute)}
                      >
                        Xử lý
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết dispute</DialogTitle>
            <DialogDescription>
              Kiểm tra bằng chứng, escrow và cập nhật quyết định xử lý.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              <div className="grid gap-3 rounded-lg border border-border/60 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Mã đơn</p>
                  <p className="font-semibold">{selected.orderNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sản phẩm</p>
                  <p className="font-semibold">{selected.itemSummary}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Buyer</p>
                  <p className="font-semibold">{selected.customer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Seller</p>
                  <p className="font-semibold">{selected.seller}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment / Escrow</p>
                  <p className="font-semibold">
                    {selected.paymentStatus} / {selected.escrowStatus}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Giá trị đơn</p>
                  <p className="font-semibold">
                    {formatCurrency(selected.orderTotal)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lý do</Label>
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-semibold">
                    {reasonLabels[selected.reason]}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {selected.description}
                  </p>
                </div>
              </div>

              {(selected.images.length > 0 || selected.videos.length > 0) && (
                <div className="space-y-2">
                  <Label>Bằng chứng</Label>
                  <div className="flex flex-wrap gap-2">
                    {[...selected.images, ...selected.videos].map((url) => (
                      <Button key={url} variant="outline" size="sm" asChild>
                        <a href={url} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Mở bằng chứng
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Trạng thái xử lý</Label>
                  <Select
                    value={nextStatus}
                    onValueChange={(value) =>
                      setNextStatus(value as ReturnStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ReturnStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Số tiền hoàn</Label>
                  <Input
                    type="number"
                    min={0}
                    value={refundAmount}
                    disabled={nextStatus !== ReturnStatus.REFUNDED}
                    onChange={(event) => setRefundAmount(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ghi chú admin</Label>
                <Textarea
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  placeholder="Nhập lý do duyệt/từ chối hoặc thông tin hoàn tiền..."
                  rows={4}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setNextStatus(ReturnStatus.APPROVED)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Duyệt trả hàng
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setNextStatus(ReturnStatus.RECEIVED)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Đã nhận hàng
                </Button>
                <Button onClick={() => setNextStatus(ReturnStatus.REFUNDED)}>
                  <CircleDollarSign className="mr-2 h-4 w-4" />
                  Hoàn tiền
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setNextStatus(ReturnStatus.REJECTED)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Từ chối
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelected(null)}
              disabled={isPending}
            >
              Đóng
            </Button>
            <Button onClick={updateDispute} disabled={isPending}>
              {isPending ? "Đang lưu..." : "Lưu quyết định"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
