"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ProductStatus } from "@/app/generated/prisma/enums"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProductStatusSelectProps {
  productId: number
  status: ProductStatus
}

const statusLabels: Record<ProductStatus, string> = {
  [ProductStatus.DRAFT]: "Chờ duyệt",
  [ProductStatus.ACTIVE]: "Đã duyệt",
  [ProductStatus.OUT_OF_STOCK]: "Hết hàng",
  [ProductStatus.DISCONTINUED]: "Từ chối/Ẩn",
}

export const ProductStatusSelect = ({
  productId,
  status,
}: ProductStatusSelectProps) => {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState(status)

  const mutation = useMutation({
    mutationFn: async (nextStatus: ProductStatus) => {
      const res = await fetch(`/api/admin/products/${productId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? "Không thể cập nhật trạng thái")
      }
      return json.data as { status: ProductStatus }
    },
    onSuccess: (data) => {
      setCurrentStatus(data.status)
      toast.success("Đã cập nhật trạng thái sản phẩm")
      router.refresh()
    },
    onError: (error) => {
      setCurrentStatus(status)
      toast.error(error.message)
    },
  })

  const handleStatusChange = (value: string) => {
    const nextStatus = value as ProductStatus
    setCurrentStatus(nextStatus)
    mutation.mutate(nextStatus)
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={mutation.isPending}
    >
      <SelectTrigger className="h-8 w-full min-w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(ProductStatus).map((item) => (
          <SelectItem key={item} value={item}>
            {statusLabels[item]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
