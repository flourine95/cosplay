"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { QuoteDialog } from "./quote-dialog"
import { QuoteTable } from "./quote-table"
import type {
  QuoteFormState,
  SellerQuoteOrder,
  SellerQuotesResponse,
} from "./quote-types"

const defaultQuoteForm: QuoteFormState = {
  quotedPrice: "1200000",
  depositAmount: "500000",
  estimatedDays: "14",
  description: "Báo giá từ seller",
}

export function QuoteListClient() {
  const [data, setData] = useState<SellerQuotesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quoteForm, setQuoteForm] = useState<QuoteFormState>(defaultQuoteForm)
  const [quoteOrder, setQuoteOrder] = useState<SellerQuoteOrder | null>(null)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/seller/custom-orders?needsQuote=true")
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error ?? "Không thể lấy danh sách chờ báo giá")
      }
      setData(json.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
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

  function handleOpenQuote(order: SellerQuoteOrder) {
    setQuoteOrder(order)
    setQuoteForm({
      quotedPrice: String(order.estimatedPrice ?? 1200000),
      depositAmount: String(order.depositAmount ?? 500000),
      estimatedDays: "14",
      description: order.quotes[0]?.description ?? "Báo giá từ seller",
    })
  }

  async function handleSendQuote() {
    if (!quoteOrder) return
    setSubmittingId(quoteOrder.id)
    try {
      const response = await fetch(
        `/api/seller/custom-orders/${quoteOrder.id}/quotes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quotedPrice: quoteForm.quotedPrice,
            depositAmount: quoteForm.depositAmount,
            estimatedDays: quoteForm.estimatedDays,
            description: quoteForm.description || undefined,
          }),
        }
      )
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? "Không thể gửi báo giá")

      toast.success("Đã gửi báo giá")
      setQuoteOrder(null)
      await loadOrders()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setSubmittingId(null)
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[420px] rounded-xl" />
  }

  const orders = data?.orders ?? []

  return (
    <Card className="border-border/80 bg-card">
      <CardHeader>
        <CardTitle>Đơn chờ báo giá</CardTitle>
        <CardDescription>
          Tạo báo giá, tiền cọc và thời gian dự kiến cho yêu cầu đặt may mới.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QuoteTable
          orders={orders}
          submittingId={submittingId}
          onOpenQuote={handleOpenQuote}
        />
      </CardContent>
      <QuoteDialog
        form={quoteForm}
        isSubmitting={submittingId === quoteOrder?.id}
        order={quoteOrder}
        onFormChange={setQuoteForm}
        onOpenChange={(open) => {
          if (!open) setQuoteOrder(null)
        }}
        onSubmit={handleSendQuote}
      />
    </Card>
  )
}
