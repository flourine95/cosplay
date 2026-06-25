"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { QuoteFormState, SellerQuoteOrder } from "./quote-types"

type QuoteDialogProps = {
  form: QuoteFormState
  isSubmitting: boolean
  order: SellerQuoteOrder | null
  onFormChange: (form: QuoteFormState) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function QuoteDialog({
  form,
  isSubmitting,
  onFormChange,
  onOpenChange,
  onSubmit,
  order,
}: QuoteDialogProps) {
  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gửi báo giá</DialogTitle>
          <DialogDescription>
            Nhập giá, tiền cọc và thời gian dự kiến cho yêu cầu đặt may.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="quoted-price">Giá báo</FieldLabel>
            <Input
              id="quoted-price"
              type="number"
              min={0}
              value={form.quotedPrice}
              onChange={(event) =>
                onFormChange({ ...form, quotedPrice: event.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deposit-amount">Tiền cọc</FieldLabel>
            <Input
              id="deposit-amount"
              type="number"
              min={0}
              value={form.depositAmount}
              onChange={(event) =>
                onFormChange({ ...form, depositAmount: event.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="estimated-days">Số ngày dự kiến</FieldLabel>
            <Input
              id="estimated-days"
              type="number"
              min={1}
              value={form.estimatedDays}
              onChange={(event) =>
                onFormChange({ ...form, estimatedDays: event.target.value })
              }
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="quote-description">Ghi chú</FieldLabel>
            <Textarea
              id="quote-description"
              value={form.description}
              onChange={(event) =>
                onFormChange({ ...form, description: event.target.value })
              }
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={isSubmitting} onClick={onSubmit}>
            Gửi báo giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
