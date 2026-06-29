"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { SellerProductListItem } from "./product-types"

type ProductDeleteDialogProps = {
  product: SellerProductListItem | null
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ProductDeleteDialog({
  product,
  isDeleting,
  onConfirm,
  onOpenChange,
}: ProductDeleteDialogProps) {
  return (
    <AlertDialog open={!!product} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa{" "}
            {product ? `"${product.name}"` : "sản phẩm này"}? Nếu sản phẩm đã có
            đơn hàng, hệ thống sẽ chuyển sang trạng thái ngừng kinh doanh để giữ
            lịch sử giao dịch.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Xóa sản phẩm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
