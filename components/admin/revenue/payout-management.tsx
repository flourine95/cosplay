"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { CheckCircle2, Loader2, Send, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

type EligiblePayoutRow = {
  sellerId: number
  sellerName: string
  sellerEmail: string
  bankName: string | null
  bankAccount: string | null
  bankAccountName: string | null
  orderCount: number
  grossAmount: number
  platformFee: number
  netAmount: number
}

type PayoutRow = {
  id: number
  sellerName: string
  orderCount: number
  amount: number
  platformFee: number
  netAmount: number
  status: string
  bankName: string | null
  bankAccount: string | null
  bankAccountName: string | null
  transferProof: string | null
  createdAt: string
  processedAt: string | null
}

interface PayoutManagementProps {
  eligiblePayouts: EligiblePayoutRow[]
  payouts: PayoutRow[]
  escrowHolding: number
  escrowReady: number
  escrowReleased: number
}

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")}đ`

const formatDate = (value: string | null) =>
  value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "-"

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang chuyển",
  COMPLETED: "Đã hoàn tất",
  FAILED: "Thất bại",
}

const statusVariants: Record<string, "default" | "secondary" | "destructive"> =
  {
    PENDING: "secondary",
    PROCESSING: "default",
    COMPLETED: "default",
    FAILED: "destructive",
  }

export function PayoutManagement({
  eligiblePayouts,
  payouts,
  escrowHolding,
  escrowReady,
  escrowReleased,
}: PayoutManagementProps) {
  const router = useRouter()
  const [selectedPayout, setSelectedPayout] = useState<PayoutRow | null>(null)
  const [transferProof, setTransferProof] = useState("")
  const [transferNote, setTransferNote] = useState("")

  const createMutation = useMutation({
    mutationFn: async (sellerId: number) => {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Không thể tạo payout")
      return json.data
    },
    onSuccess: () => {
      toast.success("Đã tạo payout cho seller")
      router.refresh()
    },
    onError: (error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      payoutId,
      status,
    }: {
      payoutId: number
      status: "COMPLETED" | "FAILED"
    }) => {
      const res = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          transferProof,
          transferNote,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Không thể cập nhật payout")
      return json.data
    },
    onSuccess: () => {
      toast.success("Đã cập nhật payout")
      setSelectedPayout(null)
      setTransferProof("")
      setTransferNote("")
      router.refresh()
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escrow đang giữ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(escrowHolding)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sẵn sàng payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(escrowReady)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã release cho seller
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {formatCurrency(escrowReleased)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Seller đủ điều kiện payout</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Ngân hàng</TableHead>
                <TableHead>Đơn</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Phí sàn</TableHead>
                <TableHead>Net payout</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eligiblePayouts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Chưa có seller nào có đơn completed đang giữ escrow.
                  </TableCell>
                </TableRow>
              ) : (
                eligiblePayouts.map((item) => (
                  <TableRow key={item.sellerId}>
                    <TableCell>
                      <div className="font-semibold">{item.sellerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.sellerEmail}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.bankName && item.bankAccount
                        ? `${item.bankName} - ${item.bankAccount}`
                        : "Chưa có thông tin"}
                    </TableCell>
                    <TableCell>{item.orderCount}</TableCell>
                    <TableCell>{formatCurrency(item.grossAmount)}</TableCell>
                    <TableCell>{formatCurrency(item.platformFee)}</TableCell>
                    <TableCell className="font-bold text-primary">
                      {formatCurrency(item.netAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={createMutation.isPending}
                        onClick={() => createMutation.mutate(item.sellerId)}
                      >
                        {createMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Tạo payout
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Lịch sử payout</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Đơn</TableHead>
                <TableHead>Net payout</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Chưa có payout nào.
                  </TableCell>
                </TableRow>
              ) : (
                payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-mono">#{payout.id}</TableCell>
                    <TableCell>{payout.sellerName}</TableCell>
                    <TableCell>{payout.orderCount}</TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(payout.netAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariants[payout.status] ?? "secondary"}
                      >
                        {statusLabels[payout.status] ?? payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(payout.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {payout.status !== "COMPLETED" &&
                        payout.status !== "FAILED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPayout(payout)}
                          >
                            Xử lý
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedPayout}
        onOpenChange={(open) => {
          if (!open) setSelectedPayout(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xử lý payout #{selectedPayout?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="font-semibold">{selectedPayout?.sellerName}</div>
              <div className="text-muted-foreground">
                Net payout: {formatCurrency(selectedPayout?.netAmount ?? 0)}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferProof">Link chứng từ chuyển khoản</Label>
              <Input
                id="transferProof"
                value={transferProof}
                onChange={(event) => setTransferProof(event.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferNote">Ghi chú</Label>
              <Textarea
                id="transferNote"
                value={transferNote}
                onChange={(event) => setTransferNote(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              disabled={updateMutation.isPending || !selectedPayout}
              onClick={() =>
                selectedPayout &&
                updateMutation.mutate({
                  payoutId: selectedPayout.id,
                  status: "FAILED",
                })
              }
            >
              <XCircle className="h-4 w-4" />
              Thất bại
            </Button>
            <Button
              disabled={updateMutation.isPending || !selectedPayout}
              onClick={() =>
                selectedPayout &&
                updateMutation.mutate({
                  payoutId: selectedPayout.id,
                  status: "COMPLETED",
                })
              }
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Hoàn tất payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
