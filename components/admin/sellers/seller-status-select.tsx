"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SellerStatus } from "@/app/generated/prisma/enums"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SellerStatusSelectProps {
  sellerId: number
  sellerStatus: SellerStatus | null
}

const statusLabels: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: "Chờ duyệt",
  [SellerStatus.APPROVED]: "Đã duyệt",
  [SellerStatus.REJECTED]: "Từ chối",
  [SellerStatus.SUSPENDED]: "Tạm khóa",
}

export const SellerStatusSelect = ({
  sellerId,
  sellerStatus,
}: SellerStatusSelectProps) => {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState(
    sellerStatus ?? SellerStatus.PENDING
  )

  const mutation = useMutation({
    mutationFn: async (nextStatus: SellerStatus) => {
      const res = await fetch(`/api/admin/sellers/${sellerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerStatus: nextStatus }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? "Không thể cập nhật seller")
      }
      return json.data as { sellerStatus: SellerStatus }
    },
    onSuccess: (data) => {
      setCurrentStatus(data.sellerStatus)
      toast.success("Đã cập nhật trạng thái seller")
      router.refresh()
    },
    onError: (error) => {
      setCurrentStatus(sellerStatus ?? SellerStatus.PENDING)
      toast.error(error.message)
    },
  })

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => mutation.mutate(value as SellerStatus)}
      disabled={mutation.isPending}
    >
      <SelectTrigger className="h-8 w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(SellerStatus).map((status) => (
          <SelectItem key={status} value={status}>
            {statusLabels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
