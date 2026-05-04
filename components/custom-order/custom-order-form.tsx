"use client"

import React, { useState } from "react"
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
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"

const steps = [
  { id: 1, label: "Gửi yêu cầu", active: true },
  { id: 2, label: "Nhận báo giá", active: false },
  { id: 3, label: "Cọc & Thực hiện", active: false },
  { id: 4, label: "Nghiệm thu", active: false },
]

const measurements = [
  { label: "Chiều cao", unit: "cm", placeholder: "168" },
  { label: "Cân nặng", unit: "kg", placeholder: "55" },
  { label: "Vòng ngực", unit: "cm", placeholder: "86" },
  { label: "Vòng eo", unit: "cm", placeholder: "68" },
  { label: "Vòng mông", unit: "cm", placeholder: "90" },
  { label: "Vai rộng", unit: "cm", placeholder: "38" },
  { label: "Dài tay", unit: "cm", placeholder: "58" },
  { label: "Dài quần", unit: "cm", placeholder: "100" },
]

export function CustomOrderForm() {
  const [date, setDate] = useState<Date>()
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [projectName, setProjectName] = useState("")
  const [budget, setBudget] = useState("")
  const [details, setDetails] = useState("")
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">
              Đặt may theo yêu cầu
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight lg:text-4xl">
            Yêu cầu Đặt may <span className="text-primary">Cosplay</span>
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Gửi chi tiết nhân vật và số đo của bạn để Maker báo giá chính xác.
            Miễn phí tư vấn.
          </p>
          <div className="mt-5 flex items-center gap-0 overflow-x-auto pb-1">
            {steps.map((step, i) => (
              <React.Fragment key={step.id}>
                <div
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium",
                    step.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-xs font-bold",
                      step.active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {step.id}
                  </span>
                  {step.label}
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-border" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Ảnh tham khảo */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UploadCloud className="h-5 w-5 text-primary" />
                  Ảnh tham khảo nhân vật
                  <span className="ml-0.5 text-destructive">*</span>
                </CardTitle>
                <CardDescription>
                  Tải ảnh mặt trước, mặt sau, chi tiết phụ kiện — càng nhiều góc
                  càng tốt.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-10 text-center transition-all hover:border-primary/50 hover:bg-primary/5">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files).map(
                          (file) => file.name
                        )
                        setUploadedFiles((prev) => [...prev, ...files])
                      }
                    }}
                  />
                  <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-semibold">Kéo thả ảnh vào đây</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    hoặc nhấn để chọn file
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Tối đa 5 ảnh • JPG, PNG • Dưới 10MB / ảnh
                  </p>
                </label>
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {uploadedFiles.map((f) => (
                      <Badge
                        key={f}
                        variant="secondary"
                        className="gap-1.5 py-1 pr-1 pl-2"
                      >
                        🖼 {f}
                        <button
                          type="button"
                          onClick={() =>
                            setUploadedFiles((prev) =>
                              prev.filter((x) => x !== f)
                            )
                          }
                          className="ml-0.5 rounded hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thông tin nhân vật */}
            <Card className="border-border/60 shadow-sm">
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
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Thể loại</Label>
                    <Select>
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
                    className="min-h-[120px] resize-none"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
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
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "dd/MM/yyyy") : "Chọn ngày..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(d) => d < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Đơn đặt may thường mất 3–6 tuần
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Số đo */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ruler className="h-5 w-5 text-primary" />
                  Profile Số đo
                </CardTitle>
                <CardDescription>
                  Chọn profile đã lưu hoặc nhập trực tiếp bên dưới.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Select>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Chọn profile số đo đã lưu..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="my_size">
                        Số đo của tôi (Cập nhật 1 tháng trước)
                      </SelectItem>
                      <SelectItem value="friend_size">
                        Số đo của Nam (Bạn)
                      </SelectItem>
                      <SelectItem value="custom">Nhập số đo mới</SelectItem>
                    </SelectContent>
                  </Select>
                  <Link
                    href="#"
                    className="shrink-0 text-sm text-primary hover:underline"
                  >
                    + Quản lý
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-4 md:grid-cols-4">
                  {measurements.map((m) => (
                    <div key={m.label} className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {m.label}
                      </Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          placeholder={m.placeholder}
                          className="h-8 text-sm"
                        />
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {m.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-20 border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tóm tắt yêu cầu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {[
                  { label: "Nhân vật", value: projectName || "Chưa nhập" },
                  {
                    label: "Deadline",
                    value: date ? format(date, "dd/MM/yyyy") : "Chưa chọn",
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
                  <div key={item.label} className="flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-right font-medium">{item.value}</span>
                  </div>
                ))}
                <Separator />
                <div className="space-y-1 rounded-lg bg-primary/10 p-3 text-xs text-primary">
                  <p className="font-semibold">Quy trình sau khi gửi:</p>
                  <ol className="list-inside list-decimal space-y-1 text-primary/80">
                    <li>Maker xem xét & báo giá trong 24h</li>
                    <li>Bạn duyệt giá & đặt cọc 30–50%</li>
                    <li>Maker tiến hành gia công</li>
                    <li>Nghiệm thu & thanh toán phần còn lại</li>
                  </ol>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Chỉ là bước gửi yêu cầu.{" "}
                    <strong>Bạn chưa cần thanh toán</strong> ở bước này.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 border-t pt-4">
                <Button
                  size="lg"
                  className="w-full font-semibold"
                  onClick={() => {
                    if (
                      !projectName.trim() ||
                      !details.trim() ||
                      !date ||
                      uploadedFiles.length === 0
                    ) {
                      alert(
                        "Vui lòng điền đầy đủ Tên nhân vật, Ảnh tham khảo, Mô tả chi tiết và Ngày nhận hàng!"
                      )
                      return
                    }
                    const randomId = Math.floor(10000 + Math.random() * 90000)
                    router.push(`/custom-order/${randomId}`)
                  }}
                >
                  <Scissors className="mr-2 h-4 w-4" />
                  Gửi yêu cầu Báo giá
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                >
                  Hủy bỏ
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
