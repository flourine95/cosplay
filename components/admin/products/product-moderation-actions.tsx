"use client"

import { useState } from "react"
import { CheckCircle2, EyeOff, Loader2, RotateCcw } from "lucide-react"
import { ProductStatus } from "@/app/generated/prisma/enums"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type ProductModerationActionsProps = {
  productId: number
  status: ProductStatus
}

const statusMessages: Record<ProductStatus, string> = {
  [ProductStatus.DRAFT]: "Đã chuyển về chờ duyệt",
  [ProductStatus.ACTIVE]: "Đã duyệt sản phẩm",
  [ProductStatus.OUT_OF_STOCK]: "Đã đánh dấu hết hàng",
  [ProductStatus.DISCONTINUED]: "Đã từ chối/ẩn sản phẩm",
}

export function ProductModerationActions({
  productId,
  status,
}: ProductModerationActionsProps) {
  const router = useRouter()
  const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(null)

  async function updateStatus(nextStatus: ProductStatus) {
    setPendingStatus(nextStatus)
    try {
      const res = await fetch(`/api/admin/products/${productId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? "Không thể cập nhật trạng thái")
      }

      toast.success(statusMessages[nextStatus])
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setPendingStatus(null)
    }
  }

  const isPending = pendingStatus !== null

  if (status === ProductStatus.DRAFT) {
    return (
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => updateStatus(ProductStatus.ACTIVE)}
        >
          {pendingStatus === ProductStatus.ACTIVE ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Duyệt
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => updateStatus(ProductStatus.DISCONTINUED)}
        >
          {pendingStatus === ProductStatus.DISCONTINUED ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          Từ chối
        </Button>
      </div>
    )
  }

  if (status === ProductStatus.ACTIVE) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => updateStatus(ProductStatus.DISCONTINUED)}
      >
        {pendingStatus === ProductStatus.DISCONTINUED ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
        Ẩn
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => updateStatus(ProductStatus.DRAFT)}
    >
      {pendingStatus === ProductStatus.DRAFT ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RotateCcw className="h-4 w-4" />
      )}
      Xem lại
    </Button>
  )
}
