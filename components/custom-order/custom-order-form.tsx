"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  CalendarIcon,
  UploadCloud,
  Info,
  Scissors,
  ChevronRight,
  Ruler,
  Sparkles,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------

const steps = [
  { id: 1, label: "Bạn gửi yêu cầu", active: true },
  { id: 2, label: "Maker báo giá", active: false },
  { id: 3, label: "Cọc & Gia công", active: false },
  { id: 4, label: "Nghiệm thu", active: false },
]

const measurements = [
  { label: "Chiều cao", unit: "cm", placeholder: "168", field: "height" },
  { label: "Cân nặng",  unit: "kg", placeholder: "55",  field: "weight" },
  { label: "Vòng ngực", unit: "cm", placeholder: "86",  field: "chest" },
  { label: "Vòng eo",   unit: "cm", placeholder: "68",  field: "waist" },
  { label: "Vòng mông", unit: "cm", placeholder: "90",  field: "hips" },
  { label: "Vai rộng",  unit: "cm", placeholder: "38",  field: "shoulder" },
  { label: "Dài tay",   unit: "cm", placeholder: "58",  field: "armLength" },
  { label: "Dài quần",  unit: "cm", placeholder: "100", field: "legLength" },
]

const DRAFT_KEY = "custom-order-draft"

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

type FormErrors = {
  projectName?: string
  details?: string
  date?: string
  images?: string
}

type UploadedFile = {
  name: string
  preview: string
}

type MeasurementProfile = {
  id: number
  name: string
  updatedAt: string
  isDefault: boolean
  height?: number | null
  weight?: number | null
  chest?: number | null
  waist?: number | null
  hips?: number | null
  shoulder?: number | null
  armLength?: number | null
  legLength?: number | null
  neck?: number | null
  notes?: string | null
}

type Seller = {
  id: number
  name: string
  shopName: string | null
  shopLogo: string | null
  sellerRating: number
  sellerTotalReviews: number
}

// -------------------------------------------------------------------------
// Component
// -------------------------------------------------------------------------

export function CustomOrderForm() {
  // --- Form state ---
  const [date, setDate] = useState<Date>()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [projectName, setProjectName] = useState("")
  const [category, setCategory] = useState("")
  const [budget, setBudget] = useState("")
  const [details, setDetails] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)

  // --- Measurement state ---
  const [measurementProfiles, setMeasurementProfiles] = useState<MeasurementProfile[]>([])
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string>("")
  const [measurementValues, setMeasurementValues] = useState<Record<string, string>>({})
  const [isMeasurementsLoading, setIsMeasurementsLoading] = useState(true)
  const [measurementsError, setMeasurementsError] = useState<string | null>(null)

  // --- Seller state ---
  const [sellers, setSellers] = useState<Seller[]>([])
  const [selectedSellerId, setSelectedSellerId] = useState<string>("")
  const [isSellersLoading, setIsSellersLoading] = useState(true)
  const [sellersError, setSellersError] = useState<string | null>(null)

  const router = useRouter()

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function applyProfile(profile: MeasurementProfile) {
    const next: Record<string, string> = {}
    for (const m of measurements) {
      const val = profile[m.field as keyof MeasurementProfile]
      next[m.field] = val != null ? String(val) : ""
    }
    setMeasurementValues(next)
  }

  const hasFormData = () => {
    return projectName || details || budget || uploadedFiles.length > 0
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!projectName.trim())
      newErrors.projectName = "Vui lòng nhập tên nhân vật hoặc tên bộ đồ"
    if (!details.trim())
      newErrors.details = "Vui lòng mô tả chi tiết yêu cầu của bạn"
    if (!date) newErrors.date = "Vui lòng chọn ngày bạn muốn nhận hàng"
    if (uploadedFiles.length === 0)
      newErrors.images = "Vui lòng tải lên ít nhất 1 ảnh tham khảo"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterName: projectName,
          description: details,
          deadline: date?.toISOString(),
          estimatedPrice: budget,
          measurementId:
            selectedMeasurementId !== "__manual__"
              ? selectedMeasurementId
              : undefined,
          sellerId: selectedSellerId || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Lỗi không xác định")

      localStorage.removeItem(DRAFT_KEY)
      router.push(
        `/custom-order/success?id=${data.orderId}&name=${encodeURIComponent(projectName)}`
      )
    } catch (err) {
      console.error("Submit error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (hasFormData()) {
      setShowCancelDialog(true)
    } else {
      router.push("/")
    }
  }

  const confirmCancel = () => {
    localStorage.removeItem(DRAFT_KEY)
    router.push("/")
  }

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------

  // Fetch measurement profiles from DB
  useEffect(() => {
    async function fetchMeasurements() {
      try {
        setIsMeasurementsLoading(true)
        const res = await fetch("/api/measurements")
        if (!res.ok) throw new Error()
        const data: MeasurementProfile[] = await res.json()
        setMeasurementProfiles(data)

        // Auto-select isDefault profile, otherwise first one
        const defaultProfile = data.find((p) => p.isDefault) ?? data[0]
        if (defaultProfile) {
          setSelectedMeasurementId(String(defaultProfile.id))
          applyProfile(defaultProfile)
        }
      } catch {
        setMeasurementsError("Không thể tải số đo. Vui lòng nhập thủ công.")
      } finally {
        setIsMeasurementsLoading(false)
      }
    }
    fetchMeasurements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch sellers from DB
  useEffect(() => {
    async function fetchSellers() {
      try {
        setIsSellersLoading(true)
        const res = await fetch("/api/sellers")
        if (!res.ok) throw new Error()
        const data: Seller[] = await res.json()
        setSellers(data)
      } catch {
        setSellersError("Không thể tải danh sách Maker.")
      } finally {
        setIsSellersLoading(false)
      }
    }
    fetchSellers()
  }, [])

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (!draft) return
    try {
      const parsed = JSON.parse(draft)
      if (parsed.projectName) setProjectName(parsed.projectName)
      if (parsed.category) setCategory(parsed.category)
      if (parsed.budget) setBudget(parsed.budget)
      if (parsed.details) setDetails(parsed.details)
      if (parsed.date) setDate(new Date(parsed.date))
    } catch (e) {
      console.error("Failed to load draft:", e)
    }
  }, [])

  // Autosave draft every 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (projectName || details || budget) {
        const draft = {
          projectName,
          category,
          budget,
          details,
          date: date?.toISOString(),
        }
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 2000)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [projectName, category, budget, details, date])

  // Keyboard shortcut Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Page header */}
      <div className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Đặt may theo yêu cầu</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
                Đặt may Cosplay theo yêu cầu
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Gửi chi tiết nhân vật và số đo để Maker báo giá chính xác. Miễn
                phí tư vấn.
              </p>
            </div>
            {draftSaved && (
              <Badge variant="secondary" className="shrink-0 gap-1.5">
                <CheckCircle className="h-3 w-3" />
                Đã lưu nháp
              </Badge>
            )}
          </div>

          {/* Process Timeline */}
          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Quy trình đặt may
            </p>
            <div className="flex flex-col gap-2 rounded-lg bg-muted/30 p-4 md:flex-row md:items-center md:gap-4">
              {steps.map((step, i) => (
                <React.Fragment key={step.id}>
                  <div
                    className={cn(
                      "flex items-center gap-2 text-xs",
                      step.active
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        step.active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {step.id}
                    </span>
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.label.split(" ")[0]}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight className="hidden h-3 w-3 shrink-0 text-border md:block" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Sau khi gửi, bạn sẽ theo dõi tiến độ real-time và trao đổi với
              Maker.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">

              {/* ── Ảnh tham khảo ── */}
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UploadCloud className="h-5 w-5 text-primary" />
                    Ảnh tham khảo nhân vật
                    <span className="text-destructive">*</span>
                  </CardTitle>
                  <CardDescription>
                    Tải ảnh mặt trước, mặt sau, chi tiết phụ kiện — càng nhiều
                    góc càng tốt.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label
                    className={cn(
                      "flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all",
                      errors.images
                        ? "border-destructive/50 hover:border-destructive"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files).map(
                            (f) => ({
                              name: f.name,
                              preview: URL.createObjectURL(f),
                            })
                          )
                          setUploadedFiles((prev) => [...prev, ...newFiles])
                          setErrors((prev) => ({ ...prev, images: undefined }))
                        }
                      }}
                    />
                    <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="font-semibold text-foreground">
                      Kéo thả ảnh vào đây
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      hoặc nhấn để chọn file
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Tối đa 5 ảnh · JPG, PNG, WebP · Dưới 10MB / ảnh
                    </p>
                  </label>
                  {errors.images && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.images}
                    </p>
                  )}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square overflow-hidden rounded-lg border-2 border-border bg-muted"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              URL.revokeObjectURL(file.preview)
                              setUploadedFiles((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }}
                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/90"
                            aria-label={`Xóa ảnh ${file.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <p className="truncate text-xs font-medium text-white">
                              {file.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── Thông tin nhân vật ── */}
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Thông tin nhân vật & Yêu cầu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">
                        Tên nhân vật / Tên bộ đồ{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="projectName"
                        placeholder="VD: Genshin Impact – Raiden Shogun"
                        value={projectName}
                        onChange={(e) => {
                          setProjectName(e.target.value)
                          if (e.target.value.trim()) {
                            setErrors((prev) => ({
                              ...prev,
                              projectName: undefined,
                            }))
                          }
                        }}
                        onBlur={() => {
                          if (!projectName.trim()) {
                            setErrors((prev) => ({
                              ...prev,
                              projectName:
                                "Vui lòng nhập tên nhân vật hoặc tên bộ đồ",
                            }))
                          }
                        }}
                        className={
                          errors.projectName ? "border-destructive" : ""
                        }
                        autoFocus
                      />
                      {errors.projectName && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {errors.projectName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Thể loại</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Chọn thể loại..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anime">Anime / Manga</SelectItem>
                          <SelectItem value="game">Game</SelectItem>
                          <SelectItem value="movie">Phim / Series</SelectItem>
                          <SelectItem value="original">
                            Original Design
                          </SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details">
                      Mô tả chi tiết & Chú ý đặc biệt{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="details"
                      placeholder="VD: Cổ áo may rộng hơn 2cm, viền dùng vải phi bóng thay vì da, cần móc gắn kiếm ở lưng..."
                      className={cn(
                        "min-h-[120px] resize-none",
                        errors.details ? "border-destructive" : ""
                      )}
                      value={details}
                      onChange={(e) => {
                        setDetails(e.target.value)
                        if (e.target.value.trim()) {
                          setErrors((prev) => ({ ...prev, details: undefined }))
                        }
                      }}
                      onBlur={() => {
                        if (!details.trim()) {
                          setErrors((prev) => ({
                            ...prev,
                            details: "Vui lòng mô tả chi tiết yêu cầu của bạn",
                          }))
                        }
                      }}
                    />
                    {errors.details && (
                      <p className="flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {errors.details}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {details.length}/500 ký tự
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Ngân sách dự kiến (VNĐ)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="VD: 2000000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Giúp Maker báo giá phù hợp hơn
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Ngày muốn nhận hàng{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground",
                              errors.date && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date
                              ? format(date, "dd/MM/yyyy")
                              : "Chọn ngày..."}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => {
                              setDate(d)
                              if (d)
                                setErrors((prev) => ({
                                  ...prev,
                                  date: undefined,
                                }))
                            }}
                            initialFocus
                            disabled={(d) => d < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {errors.date}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Đơn đặt may thường mất 3–6 tuần
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Chọn Maker ── */}
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Scissors className="h-5 w-5 text-primary" />
                    Chọn Maker
                  </CardTitle>
                  <CardDescription>
                    Chỉ định Maker bạn muốn đặt may, hoặc để trống để nhận báo
                    giá từ nhiều Maker.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isSellersLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải danh sách Maker...
                    </div>
                  ) : sellersError ? (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {sellersError}
                    </p>
                  ) : (
                    <Select
                      value={selectedSellerId}
                      onValueChange={(val) => {
                        setSelectedSellerId(val === "__none__" ? "" : val)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Để trống — nhận báo giá từ nhiều Maker..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">
                          Không chỉ định — nhận báo giá từ nhiều Maker
                        </SelectItem>
                        {sellers.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            <div className="flex items-center gap-2">
                              {s.shopLogo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={s.shopLogo}
                                  alt={s.shopName ?? s.name}
                                  className="h-5 w-5 rounded-full object-cover"
                                />
                              ) : (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                  {(s.shopName ?? s.name).charAt(0).toUpperCase()}
                                </span>
                              )}
                              <span>
                                {s.shopName ?? s.name}
                                {s.shopName && (
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    · {s.name}
                                  </span>
                                )}
                              </span>
                              {s.sellerRating > 0 && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                  ★ {s.sellerRating.toFixed(1)}{" "}
                                  <span className="text-muted-foreground/60">
                                    ({s.sellerTotalReviews})
                                  </span>
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Preview seller đã chọn */}
                  {selectedSellerId && (() => {
                    const s = sellers.find((s) => String(s.id) === selectedSellerId)
                    if (!s) return null
                    return (
                      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                        {s.shopLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.shopLogo}
                            alt={s.shopName ?? s.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                            {(s.shopName ?? s.name).charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {s.shopName ?? s.name}
                          </p>
                          {s.shopName && (
                            <p className="text-xs text-muted-foreground">{s.name}</p>
                          )}
                          {s.sellerRating > 0 && (
                            <p className="text-xs text-muted-foreground">
                              ★ {s.sellerRating.toFixed(1)} · {s.sellerTotalReviews} đánh giá
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground"
                          onClick={() => setSelectedSellerId("")}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* ── Số đo cơ thể ── */}
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Ruler className="h-5 w-5 text-primary" />
                        Số đo cơ thể
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Chọn profile đã lưu hoặc nhập trực tiếp bên dưới.
                      </CardDescription>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                          >
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="text-xs font-semibold">
                            Cách đo chính xác:
                          </p>
                          <ul className="mt-1 space-y-1 text-xs">
                            <li>• Đo khi mặc đồ lót mỏng</li>
                            <li>• Thước dây không quá chặt hoặc lỏng</li>
                            <li>• Đứng thẳng, thả lỏng tự nhiên</li>
                            <li>• Nhờ người khác đo để chính xác hơn</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Dropdown chọn profile */}
                  <div className="flex items-center gap-3">
                    {isMeasurementsLoading ? (
                      <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải số đo...
                      </div>
                    ) : measurementsError ? (
                      <p className="flex flex-1 items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {measurementsError}
                      </p>
                    ) : (
                      <Select
                        value={selectedMeasurementId}
                        onValueChange={(val) => {
                          if (val === "__manual__") {
                            setSelectedMeasurementId("__manual__")
                            setMeasurementValues({})
                            return
                          }
                          setSelectedMeasurementId(val)
                          const profile = measurementProfiles.find(
                            (p) => String(p.id) === val
                          )
                          if (profile) applyProfile(profile)
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Chọn profile số đo đã lưu..." />
                        </SelectTrigger>
                        <SelectContent>
                          {measurementProfiles.length === 0 ? (
                            <SelectItem value="__empty__" disabled>
                              Chưa có profile nào
                            </SelectItem>
                          ) : (
                            measurementProfiles.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                                {p.isDefault && (
                                  <span className="ml-1.5 text-xs text-muted-foreground">
                                    · Mặc định
                                  </span>
                                )}
                              </SelectItem>
                            ))
                          )}
                          <SelectItem value="__manual__">
                            Nhập số đo mới (thủ công)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Link
                      href="/profile/measurements"
                      className="shrink-0 text-sm text-primary hover:underline"
                    >
                      Quản lý
                    </Link>
                  </div>

                  {/* Grid nhập số đo */}
                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-4 md:grid-cols-4">
                    {measurements.map((m) => (
                      <div key={m.field} className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">
                          {m.label}
                        </Label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            placeholder={m.placeholder}
                            className="h-8 text-sm"
                            value={measurementValues[m.field] ?? ""}
                            onChange={(e) =>
                              setMeasurementValues((prev) => ({
                                ...prev,
                                [m.field]: e.target.value,
                              }))
                            }
                          />
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {m.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes từ profile nếu có */}
                  {selectedMeasurementId !== "__manual__" &&
                    measurementProfiles.find(
                      (p) => String(p.id) === selectedMeasurementId
                    )?.notes && (
                      <p className="flex items-start gap-1.5 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        <Info className="mt-0.5 h-3 w-3 shrink-0" />
                        {
                          measurementProfiles.find(
                            (p) => String(p.id) === selectedMeasurementId
                          )?.notes
                        }
                      </p>
                    )}
                </CardContent>
              </Card>
            </div>

            {/* ── Sidebar ── */}
            <div>
              <Card className="sticky top-20 border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tóm tắt yêu cầu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {[
                    { label: "Nhân vật", value: projectName || "Chưa nhập" },
                    {
                      label: "Maker",
                      value: selectedSellerId
                        ? (sellers.find((s) => String(s.id) === selectedSellerId)?.shopName
                          ?? sellers.find((s) => String(s.id) === selectedSellerId)?.name
                          ?? "Đã chọn")
                        : "Nhận từ nhiều Maker",
                    },
                    {
                      label: "Deadline",
                      value: date
                        ? format(date, "dd/MM/yyyy")
                        : "Chưa chọn",
                    },
                    {
                      label: "Ngân sách",
                      value: budget
                        ? `${Number(budget).toLocaleString()} đ`
                        : "Chưa nhập",
                    },
                    {
                      label: "Ảnh tham khảo",
                      value:
                        uploadedFiles.length > 0
                          ? `${uploadedFiles.length} ảnh`
                          : "Chưa có",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between gap-4"
                    >
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="text-right font-medium text-foreground">
                        {item.value}
                      </span>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">
                      Quy trình sau khi gửi:
                    </p>
                    <ol className="space-y-1.5">
                      {[
                        "Maker xem xét & báo giá trong 24h",
                        "Bạn duyệt giá & đặt cọc 30–50%",
                        "Maker tiến hành gia công",
                        "Nghiệm thu & thanh toán phần còn lại",
                      ].map((step, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Chỉ là bước gửi yêu cầu.{" "}
                      <span className="font-semibold text-foreground">
                        Bạn chưa cần thanh toán
                      </span>{" "}
                      ở bước này.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 border-t pt-4">
                  <Button
                    size="lg"
                    className="w-full rounded-full font-semibold"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      <>
                        <Scissors className="mr-2 h-4 w-4" />
                        Gửi yêu cầu báo giá
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Nhấn Ctrl+Enter để gửi nhanh
                  </p>

                  <AlertDialog
                    open={showCancelDialog}
                    onOpenChange={setShowCancelDialog}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground"
                        onClick={(e) => {
                          e.preventDefault()
                          handleCancel()
                        }}
                        disabled={isSubmitting}
                      >
                        Hủy bỏ
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Bạn có chắc muốn hủy?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Thông tin bạn đã nhập sẽ không được lưu. Bạn có thể
                          quay lại sau để tiếp tục.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Tiếp tục nhập</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmCancel}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Hủy bỏ
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}