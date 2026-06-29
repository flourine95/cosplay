"use client"

import { useState } from "react"
import { CheckCircle2, Eye, Loader2, ShieldOff, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SellerStatus } from "@/app/generated/prisma/enums"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type SellerApprovalProfile = {
  id: number
  name: string
  email: string
  phone: string | null
  shopName: string | null
  shopDescription: string | null
  businessLicense: string | null
  taxCode: string | null
  bankName: string | null
  bankAccount: string | null
  bankAccountName: string | null
  sellerStatus: SellerStatus | null
  sellerApprovedAt: string | null
  productCount: number
  revenue: number
}

type SellerApprovalDialogProps = {
  seller: SellerApprovalProfile
}

const statusLabels: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: "Chờ duyệt",
  [SellerStatus.APPROVED]: "Đã duyệt",
  [SellerStatus.REJECTED]: "Từ chối",
  [SellerStatus.SUSPENDED]: "Tạm khóa",
}

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")}đ`

const formatDate = (value: string | null) =>
  value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "Chưa có"

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border/60 py-3 last:border-0 sm:grid-cols-[160px_1fr]">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground">{value || "-"}</div>
    </div>
  )
}

export function SellerApprovalDialog({ seller }: SellerApprovalDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [pendingStatus, setPendingStatus] = useState<SellerStatus | null>(null)

  async function updateStatus(nextStatus: SellerStatus) {
    setPendingStatus(nextStatus)
    try {
      const res = await fetch(`/api/admin/sellers/${seller.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerStatus: nextStatus,
          reason: reason.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? "Không thể cập nhật seller")
      }

      toast.success("Đã cập nhật trạng thái seller")
      setOpen(false)
      setReason("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setPendingStatus(null)
    }
  }

  const currentStatus = seller.sellerStatus ?? SellerStatus.PENDING
  const hasLegalProfile = Boolean(seller.businessLicense || seller.taxCode)
  const hasBankProfile = Boolean(
    seller.bankName && seller.bankAccount && seller.bankAccountName
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4" />
          Hồ sơ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Hồ sơ seller #{seller.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/45 p-4">
            <div>
              <div className="text-lg font-semibold">
                {seller.shopName ?? "Chưa đặt tên shop"}
              </div>
              <div className="text-sm text-muted-foreground">
                {seller.name} · {seller.email}
              </div>
            </div>
            <Badge
              variant={
                currentStatus === SellerStatus.REJECTED ||
                currentStatus === SellerStatus.SUSPENDED
                  ? "destructive"
                  : "secondary"
              }
            >
              {statusLabels[currentStatus]}
            </Badge>
          </div>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Thông tin cửa hàng
            </h3>
            <div className="rounded-lg border border-border/60 px-4">
              <InfoRow label="Tên shop" value={seller.shopName} />
              <InfoRow label="Chủ shop" value={seller.name} />
              <InfoRow label="Email" value={seller.email} />
              <InfoRow label="Số điện thoại" value={seller.phone} />
              <InfoRow
                label="Mô tả shop"
                value={seller.shopDescription ?? "Chưa cập nhật"}
              />
              <InfoRow label="Số sản phẩm" value={seller.productCount} />
              <InfoRow
                label="Doanh thu"
                value={formatCurrency(seller.revenue)}
              />
              <InfoRow
                label="Ngày duyệt"
                value={formatDate(seller.sellerApprovedAt)}
              />
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Hồ sơ pháp lý
              </h3>
              <Badge variant={hasLegalProfile ? "secondary" : "outline"}>
                {hasLegalProfile ? "Có thông tin" : "Thiếu thông tin"}
              </Badge>
            </div>
            <div className="rounded-lg border border-border/60 px-4">
              <InfoRow
                label="Giấy phép kinh doanh"
                value={seller.businessLicense ?? "Chưa cập nhật"}
              />
              <InfoRow
                label="Mã số thuế"
                value={seller.taxCode ?? "Chưa cập nhật"}
              />
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Tài khoản nhận payout
              </h3>
              <Badge variant={hasBankProfile ? "secondary" : "outline"}>
                {hasBankProfile ? "Đủ thông tin" : "Thiếu thông tin"}
              </Badge>
            </div>
            <div className="rounded-lg border border-border/60 px-4">
              <InfoRow
                label="Ngân hàng"
                value={seller.bankName ?? "Chưa cập nhật"}
              />
              <InfoRow
                label="Số tài khoản"
                value={seller.bankAccount ?? "Chưa cập nhật"}
              />
              <InfoRow
                label="Chủ tài khoản"
                value={seller.bankAccountName ?? "Chưa cập nhật"}
              />
            </div>
          </section>

          <div className="space-y-2">
            <Label htmlFor={`seller-reason-${seller.id}`}>
              Lý do / ghi chú gửi seller
            </Label>
            <Textarea
              id={`seller-reason-${seller.id}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="VD: Vui lòng bổ sung mã số thuế hoặc ảnh giấy phép kinh doanh..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            disabled={pendingStatus !== null}
            onClick={() => updateStatus(SellerStatus.SUSPENDED)}
          >
            {pendingStatus === SellerStatus.SUSPENDED ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldOff className="h-4 w-4" />
            )}
            Tạm khóa
          </Button>
          <Button
            variant="destructive"
            disabled={pendingStatus !== null}
            onClick={() => updateStatus(SellerStatus.REJECTED)}
          >
            {pendingStatus === SellerStatus.REJECTED ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Từ chối
          </Button>
          <Button
            disabled={pendingStatus !== null}
            onClick={() => updateStatus(SellerStatus.APPROVED)}
          >
            {pendingStatus === SellerStatus.APPROVED ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Duyệt seller
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
