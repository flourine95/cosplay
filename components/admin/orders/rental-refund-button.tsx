"use client"

import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function RentalRefundButton({
  orderNumber,
  refundAmount,
}: {
  orderNumber: string
  refundAmount: number
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleRefund() {
    try {
      setIsSubmitting(true)
      const response = await fetch(
        `/api/admin/rental-orders/${orderNumber}/refund`,
        { method: "PATCH" }
      )
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(json.error ?? "Khong the hoan coc don thue")
      }
      toast.success("Da hoan coc va ket thuc don thue")
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Co loi xay ra")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isSubmitting}
      onClick={handleRefund}
    >
      <RotateCcw className="mr-2 h-4 w-4" />
      Hoan {refundAmount.toLocaleString("vi-VN")}d
    </Button>
  )
}
