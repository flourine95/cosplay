"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Gavel, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { RentalDisputeStatus } from "@/app/generated/prisma/enums"
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
import { RentalMessageDialog } from "@/components/rental/rental-message-dialog"

export type AdminRentalDisputeRow = {
  id: number
  orderNumber: string
  itemName: string
  customer: string
  seller: string
  reason: string
  description: string
  shopResponse: string | null
  adminNote: string | null
  status: RentalDisputeStatus
  depositAmount: number
  refundAmount: number | null
  createdAt: string
}

type RentalDisputeManagementProps = {
  disputes: AdminRentalDisputeRow[]
}

const statusLabels: Record<RentalDisputeStatus, string> = {
  [RentalDisputeStatus.OPEN]: "Mới tạo",
  [RentalDisputeStatus.SHOP_RESPONDED]: "Shop đã phản hồi",
  [RentalDisputeStatus.ADMIN_REVIEWING]: "Admin đang xem xét",
  [RentalDisputeStatus.RESOLVED_REFUND_CUSTOMER]: "Hoàn cọc cho khách",
  [RentalDisputeStatus.RESOLVED_PAY_SHOP]: "Chuyển cọc cho shop",
  [RentalDisputeStatus.RESOLVED_SPLIT]: "Chia cọc hai bên",
  [RentalDisputeStatus.CLOSED]: "Đã đóng",
}

const decisionStatuses = [
  RentalDisputeStatus.ADMIN_REVIEWING,
  RentalDisputeStatus.RESOLVED_REFUND_CUSTOMER,
  RentalDisputeStatus.RESOLVED_PAY_SHOP,
  RentalDisputeStatus.RESOLVED_SPLIT,
  RentalDisputeStatus.CLOSED,
]

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

export function RentalDisputeManagement({
  disputes,
}: RentalDisputeManagementProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<AdminRentalDisputeRow | null>(null)
  const [status, setStatus] = useState<RentalDisputeStatus>(
    RentalDisputeStatus.ADMIN_REVIEWING
  )
  const [refundAmount, setRefundAmount] = useState("")
  const [adminNote, setAdminNote] = useState("")
  const [isPending, startTransition] = useTransition()

  const openDecision = (dispute: AdminRentalDisputeRow) => {
    setSelected(dispute)
    setStatus(
      dispute.status === RentalDisputeStatus.OPEN
        ? RentalDisputeStatus.ADMIN_REVIEWING
        : dispute.status
    )
    setRefundAmount(String(dispute.refundAmount ?? dispute.depositAmount))
    setAdminNote(dispute.adminNote ?? "")
  }

  const submitDecision = () => {
    if (!selected) return
    startTransition(async () => {
      const response = await fetch(
        `/api/admin/rental-disputes/${selected.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            refundAmount: Number(refundAmount || 0),
            adminNote,
          }),
        }
      )
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(json.error ?? "Không thể lưu phán quyết")
        return
      }
      toast.success("Đã lưu phán quyết tranh chấp thuê")
      setSelected(null)
      router.refresh()
    })
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          Tranh chấp thuê đồ
        </CardTitle>
        <Badge variant="secondary">{disputes.length} vụ</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách / Shop</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Tiền cọc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có tranh chấp thuê nào.
                </TableCell>
              </TableRow>
            ) : (
              disputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell>
                    <p className="font-semibold">{dispute.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {dispute.itemName}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p>{dispute.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      Shop: {dispute.seller}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{dispute.reason}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {dispute.description}
                    </p>
                  </TableCell>
                  <TableCell>{formatCurrency(dispute.depositAmount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {statusLabels[dispute.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(dispute.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <RentalMessageDialog
                        orderNumber={dispute.orderNumber}
                        recipient="customer"
                        triggerLabel="Khách"
                        title={`Admin - khách (${dispute.orderNumber})`}
                      />
                      <RentalMessageDialog
                        orderNumber={dispute.orderNumber}
                        recipient="seller"
                        triggerLabel="Shop"
                        title={`Admin - shop (${dispute.orderNumber})`}
                      />
                      <Button size="sm" onClick={() => openDecision(dispute)}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Phán quyết
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phán quyết cuối cùng</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/60 p-3 text-sm">
                <p className="font-semibold">{selected.orderNumber}</p>
                <p className="text-muted-foreground">{selected.description}</p>
                {selected.shopResponse && (
                  <p className="mt-2 text-muted-foreground">
                    Phản hồi shop: {selected.shopResponse}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Kết quả xử lý</Label>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as RentalDisputeStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {decisionStatuses.map((item) => (
                      <SelectItem key={item} value={item}>
                        {statusLabels[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Số tiền hoàn cho khách</Label>
                <Input
                  type="number"
                  min={0}
                  max={selected.depositAmount}
                  value={refundAmount}
                  disabled={
                    status === RentalDisputeStatus.RESOLVED_PAY_SHOP ||
                    status === RentalDisputeStatus.CLOSED
                  }
                  onChange={(event) => setRefundAmount(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ghi chú/phán quyết của admin</Label>
                <Textarea
                  value={adminNote}
                  rows={4}
                  onChange={(event) => setAdminNote(event.target.value)}
                  placeholder="Nhập kết luận cuối cùng, căn cứ đối chiếu ảnh và số tiền xử lý..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Hủy
            </Button>
            <Button disabled={isPending} onClick={submitDecision}>
              {isPending ? "Đang lưu..." : "Lưu phán quyết"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
