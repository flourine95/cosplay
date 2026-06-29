"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Package,
  Plus,
  RotateCcw,
  Search,
  Star,
  Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/home/footer"
import { Navbar } from "@/components/home/navbar"
import { RentalMessageDialog } from "@/components/rental/rental-message-dialog"
import { useLiveRefresh } from "@/hooks/use-live-refresh"

type RentalTabStatus = "active" | "pending" | "returning" | "completed"

interface RentalItemType {
  id: string
  rawStatus: string
  statusLabel: string
  status: RentalTabStatus
  itemName: string
  shopName: string
  startDate: string
  endDate: string
  daysLeft: number | null
  totalPrice: number
  deposit: number
  lateFee: number
  damageFee: number
  refundAmount: number
  returnName: string
  returnPhone: string
  returnAddress: string
  returnCity: string
  returnDistrict: string
  returnWard: string
  returnAddressNote: string | null
  pickupImages: string[]
  returnImages: string[]
  image: string
  latestDispute: {
    id: number
    status: string
    statusLabel: string
    reason: string
    description: string
    shopResponse: string | null
    adminNote: string | null
    refundAmount: number | null
  } | null
}

const statusConfig: Record<
  RentalTabStatus,
  { label: string; badgeCls: string; Icon: React.ElementType }
> = {
  active: {
    label: "Đang thuê",
    badgeCls: "bg-red-500 text-white",
    Icon: AlertCircle,
  },
  pending: {
    label: "Chờ shop xử lý",
    badgeCls: "bg-amber-100 text-amber-800",
    Icon: CalendarDays,
  },
  returning: {
    label: "Đang xử lý trả đồ",
    badgeCls: "bg-blue-100 text-blue-700",
    Icon: RotateCcw,
  },
  completed: {
    label: "Đã hoàn tất",
    badgeCls: "bg-green-100 text-green-800",
    Icon: CheckCircle,
  },
}

function RentalCard({
  onChanged,
  rental,
}: {
  onChanged: () => Promise<void>
  rental: RentalItemType
}) {
  const cfg = statusConfig[rental.status]
  const [returnNote, setReturnNote] = useState("")
  const [disputeReason, setDisputeReason] = useState("")
  const [disputeDescription, setDisputeDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [pickupOpen, setPickupOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [pickupFiles, setPickupFiles] = useState<File[]>([])
  const [returnFiles, setReturnFiles] = useState<File[]>([])

  async function updateRental(payload: Record<string, unknown>) {
    setSubmitting(true)
    try {
      const response = await fetch("/api/rental/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: rental.id, ...payload }),
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        alert(json.error ?? "Không thể cập nhật đơn thuê.")
        return
      }
      await onChanged()
      setPickupOpen(false)
      setReturnOpen(false)
    } catch (error) {
      console.error(error)
      alert("Da xay ra loi.")
    } finally {
      setSubmitting(false)
    }
  }

  async function uploadEvidenceImages(files: File[]) {
    if (files.length === 0) {
      throw new Error("Vui lòng chọn ít nhất một ảnh")
    }

    const formData = new FormData()
    files.slice(0, 5).forEach((file) => formData.append("files", file))

    const response = await fetch("/api/rental/evidence-images", {
      method: "POST",
      body: formData,
    })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(json.error ?? "Không thể tải ảnh bằng chứng")
    }
    return (json.data?.urls ?? []) as string[]
  }

  async function confirmReceivedWithImages() {
    setSubmitting(true)
    try {
      const pickupImages = await uploadEvidenceImages(pickupFiles)
      await updateRental({ action: "confirmReceived", pickupImages })
    } catch (error) {
      alert(error instanceof Error ? error.message : "Đã xảy ra lỗi.")
      setSubmitting(false)
    }
  }

  async function requestReturnWithImages() {
    setSubmitting(true)
    try {
      const returnImages = await uploadEvidenceImages(returnFiles)
      await updateRental({ action: "requestReturn", returnNote, returnImages })
    } catch (error) {
      alert(error instanceof Error ? error.message : "Đã xảy ra lỗi.")
      setSubmitting(false)
    }
  }

  async function createDispute() {
    setSubmitting(true)
    try {
      const response = await fetch(
        `/api/rental/bookings/${rental.id}/dispute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: disputeReason,
            description: disputeDescription,
            images: [],
          }),
        }
      )
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        alert(json.error ?? "Không thể tạo khiếu nại.")
        return
      }
      await onChanged()
      setDisputeOpen(false)
    } catch (error) {
      console.error(error)
      alert("Đã xảy ra lỗi.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden border-border/60">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-44 w-full shrink-0 bg-muted sm:w-44">
          <Image
            src={rental.image}
            alt={rental.itemName}
            fill
            className="object-cover"
          />
        </div>

        <CardContent className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-semibold">
                  {rental.id}
                </span>
                <span className="text-xs text-muted-foreground">
                  Shop: {rental.shopName}
                </span>
              </div>
              <h3 className="text-base font-bold">{rental.itemName}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {rental.startDate} - {rental.endDate}
              </p>
            </div>
            <Badge className={`w-fit gap-1 ${cfg.badgeCls}`}>
              <cfg.Icon className="h-3 w-3" />
              {rental.statusLabel || cfg.label}
            </Badge>
          </div>

          <div className="grid gap-3 rounded-xl bg-muted/30 p-3 text-sm sm:grid-cols-3">
            <Info
              label="Phí thuê"
              value={`${rental.totalPrice.toLocaleString()} đ`}
            />
            <Info label="Cọc" value={`${rental.deposit.toLocaleString()} đ`} />
            <Info
              label="Hoàn cọc"
              value={`${rental.refundAmount.toLocaleString()} đ`}
            />
          </div>

          {(rental.lateFee > 0 || rental.damageFee > 0) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Phí trễ: {rental.lateFee.toLocaleString()} đ · Phí hư hỏng:{" "}
              {rental.damageFee.toLocaleString()} đ
            </div>
          )}

          <div className="rounded-xl border border-border/60 p-3 text-sm">
            <p className="font-semibold">Địa chỉ trả đồ của shop</p>
            <p className="mt-1 text-muted-foreground">
              {rental.returnName} - {rental.returnPhone}
            </p>
            <p className="text-muted-foreground">
              {rental.returnAddress}, {rental.returnWard},{" "}
              {rental.returnDistrict}, {rental.returnCity}
            </p>
            {rental.returnAddressNote && (
              <p className="mt-1 text-muted-foreground">
                Ghi chú: {rental.returnAddressNote}
              </p>
            )}
          </div>

          {(rental.pickupImages.length > 0 ||
            rental.returnImages.length > 0) && (
            <div className="grid gap-3 rounded-xl border border-border/60 p-3 text-sm md:grid-cols-2">
              <EvidencePreview
                label="Ảnh khi nhận đồ"
                images={rental.pickupImages}
              />
              <EvidencePreview
                label="Ảnh trước khi trả"
                images={rental.returnImages}
              />
            </div>
          )}

          {rental.latestDispute && (
            <div className="rounded-lg border border-destructive/30 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  Khiếu nại: {rental.latestDispute.reason}
                </p>
                <Badge variant="destructive">
                  {rental.latestDispute.statusLabel}
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground">
                {rental.latestDispute.description}
              </p>
              {rental.latestDispute.shopResponse && (
                <p className="mt-2 text-muted-foreground">
                  Phản hồi shop: {rental.latestDispute.shopResponse}
                </p>
              )}
              {rental.latestDispute.adminNote && (
                <p className="mt-2 font-medium">
                  Phán quyết admin: {rental.latestDispute.adminNote}
                </p>
              )}
              {rental.latestDispute.refundAmount !== null && (
                <p className="mt-1 text-muted-foreground">
                  Số tiền hoàn theo phán quyết:{" "}
                  {rental.latestDispute.refundAmount.toLocaleString()} đ
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t pt-4">
            {rental.rawStatus === "READY_FOR_PICKUP" && (
              <Dialog open={pickupOpen} onOpenChange={setPickupOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={submitting}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Xác nhận đã nhận đồ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Xác nhận đã nhận đồ</DialogTitle>
                    <DialogDescription>
                      Tải ảnh tình trạng đồ ngay khi nhận. Ảnh này sẽ gửi cho
                      shop và admin để đối chiếu khi trả đồ.
                    </DialogDescription>
                  </DialogHeader>
                  <EvidenceInput
                    files={pickupFiles}
                    label="Ảnh tình trạng đồ khi nhận"
                    onChange={setPickupFiles}
                  />
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setPickupOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      disabled={submitting || pickupFiles.length === 0}
                      onClick={confirmReceivedWithImages}
                    >
                      Gửi ảnh và xác nhận
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {["RENTED", "OVERDUE"].includes(rental.rawStatus) && (
              <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Package className="mr-2 h-4 w-4" />
                    Yêu cầu trả đồ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yêu cầu trả đồ</DialogTitle>
                    <DialogDescription>
                      Mô tả tình trạng đồ khi trả để shop kiểm tra.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                    <p className="font-semibold">Gửi đồ về địa chỉ shop</p>
                    <p className="mt-1 text-muted-foreground">
                      {rental.returnName} - {rental.returnPhone}
                    </p>
                    <p className="text-muted-foreground">
                      {rental.returnAddress}, {rental.returnWard},{" "}
                      {rental.returnDistrict}, {rental.returnCity}
                    </p>
                    {rental.returnAddressNote && (
                      <p className="mt-1 text-muted-foreground">
                        Ghi chú: {rental.returnAddressNote}
                      </p>
                    )}
                  </div>
                  <Textarea
                    value={returnNote}
                    onChange={(event) => setReturnNote(event.target.value)}
                    placeholder="VD: Đồ còn nguyên vẹn, phụ kiện đầy đủ..."
                    className="min-h-[90px] resize-none"
                  />
                  <EvidenceInput
                    files={returnFiles}
                    label="Ảnh tình trạng đồ trước khi trả"
                    onChange={setReturnFiles}
                  />
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setReturnOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      disabled={submitting || returnFiles.length === 0}
                      onClick={requestReturnWithImages}
                    >
                      Gửi ảnh và yêu cầu
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {["DEPOSIT_REFUNDED", "COMPLETED"].includes(rental.rawStatus) &&
              (rental.lateFee > 0 || rental.damageFee > 0) &&
              !rental.latestDispute && (
                <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      Khiếu nại khấu trừ
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tạo khiếu nại đơn thuê</DialogTitle>
                      <DialogDescription>
                        Gửi lý do nếu bạn không đồng ý với phí khấu trừ cọc.
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      value={disputeReason}
                      onChange={(event) => setDisputeReason(event.target.value)}
                      placeholder="Lý do khiếu nại"
                    />
                    <Textarea
                      value={disputeDescription}
                      onChange={(event) =>
                        setDisputeDescription(event.target.value)
                      }
                      placeholder="Mô tả chi tiết..."
                      className="min-h-[90px] resize-none"
                    />
                    <DialogFooter>
                      <Button
                        variant="ghost"
                        onClick={() => setDisputeOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        disabled={
                          submitting ||
                          !disputeReason.trim() ||
                          !disputeDescription.trim()
                        }
                        onClick={createDispute}
                      >
                        Gửi khiếu nại
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

            {rental.status === "completed" && (
              <Button size="sm" variant="outline">
                <Star className="mr-2 h-4 w-4 fill-amber-400 text-amber-400" />
                Đánh giá
              </Button>
            )}

            {(rental.status === "active" || rental.status === "pending") && (
              <RentalMessageDialog
                orderNumber={rental.id}
                title={`Tin nhắn với shop - ${rental.id}`}
                triggerLabel="Nhắn tin shop"
              />
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export function RentalManagement() {
  const [search, setSearch] = useState("")
  const [rentals, setRentals] = useState<RentalItemType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRentals = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true)
      setError(null)
      const response = await fetch("/api/rental/bookings")
      if (!response.ok) throw new Error("Không thể tải danh sách đơn thuê")
      const data = await response.json()
      setRentals(data.rentals || [])
    } catch (err) {
      setError((err as Error).message || "Da xay ra loi")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchRentals(true)
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [fetchRentals])

  useLiveRefresh({
    enabled: !isLoading,
    intervalMs: 4000,
    onRefresh: () => fetchRentals(false),
  })

  const counts = {
    all: rentals.length,
    active: rentals.filter((r) => r.status === "active").length,
    pending: rentals.filter((r) => r.status === "pending").length,
    returning: rentals.filter((r) => r.status === "returning").length,
    completed: rentals.filter((r) => r.status === "completed").length,
  }

  const filtered = useMemo(
    () =>
      rentals.filter(
        (r) =>
          r.id.toLowerCase().includes(search.toLowerCase()) ||
          r.itemName.toLowerCase().includes(search.toLowerCase())
      ),
    [rentals, search]
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
          <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">
              Quản lý đơn thuê
            </span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Quản lý đơn thuê đồ
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Theo dõi lịch thuê, xác nhận nhận đồ, trả đồ và tiền cọc.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã hoặc tên đồ..."
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Đang tải lịch sử đặt thuê...
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm font-semibold text-destructive">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-6 flex w-full overflow-x-auto sm:inline-flex sm:w-auto">
              <TabsTrigger value="all">Tất cả ({counts.all})</TabsTrigger>
              <TabsTrigger value="active">
                Đang thuê ({counts.active})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Chờ giao ({counts.pending})
              </TabsTrigger>
              <TabsTrigger value="returning">
                Đang trả ({counts.returning})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Xong ({counts.completed})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filtered.length === 0 ? (
                <p className="py-16 text-center text-muted-foreground">
                  Không tìm thấy đơn thuê nào.
                </p>
              ) : (
                filtered.map((r) => (
                  <RentalCard
                    key={r.id}
                    rental={r}
                    onChanged={() => fetchRentals(false)}
                  />
                ))
              )}
            </TabsContent>
            {(
              [
                "active",
                "pending",
                "returning",
                "completed",
              ] as RentalTabStatus[]
            ).map((status) => (
              <TabsContent key={status} value={status} className="space-y-4">
                {filtered
                  .filter((r) => r.status === status)
                  .map((r) => (
                    <RentalCard
                      key={r.id}
                      rental={r}
                      onChanged={() => fetchRentals(false)}
                    />
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        )}

        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row">
          <div>
            <p className="text-lg font-bold">Muốn thuê thêm trang phục?</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Khám phá thêm các bộ cosplay đang có sẵn.
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-full px-6">
            <Link href="/products">
              <Plus className="mr-1.5 h-4 w-4" />
              Xem catalog thuê đồ
            </Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}

function EvidenceInput({
  files,
  label,
  onChange,
}: {
  files: File[]
  label: string
  onChange: (files: File[]) => void
}) {
  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
        <Upload className="h-4 w-4" />
        {label}
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) =>
            onChange(Array.from(event.target.files ?? []).slice(0, 5))
          }
        />
      </label>
      <p className="text-xs text-muted-foreground">
        {files.length > 0
          ? `Đã chọn ${files.length} ảnh`
          : "Bắt buộc tải ít nhất 1 ảnh, tối đa 5 ảnh."}
      </p>
    </div>
  )
}

function EvidencePreview({
  images,
  label,
}: {
  images: string[]
  label: string
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        {label}
      </p>
      {images.length === 0 ? (
        <p className="text-xs text-muted-foreground">Chưa có ảnh</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {images.slice(0, 5).map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="relative block h-16 w-16 overflow-hidden rounded-md border border-border bg-muted"
            >
              <Image src={url} alt={label} fill className="object-cover" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
