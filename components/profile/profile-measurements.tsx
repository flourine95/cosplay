"use client"

import React, { useState, useEffect } from "react"
import {
  Ruler,
  Plus,
  Edit3,
  Trash2,
  Star,
  Download,
  Upload,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"

// Cấu trúc dữ liệu Measurement khớp chính xác 100% với các cột int4, float8, text trong DB của bạn
type Measurement = {
  id: number
  userId: number
  name: string
  height: number | null
  weight: number | null
  chest: number | null // Khớp với cột 'chest' trong DB thay vì 'bust'
  waist: number | null
  hips: number | null
  shoulder: number | null
  armLength: number | null
  legLength: number | null
  neck: number | null // Cột vòng cổ mới thêm trong DB
  additionalMeasurements: any
  notes: string | null // Cột ghi chú mới thêm trong DB
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

const measurementFields = [
  { key: "height", label: "Chiều cao", unit: "cm", placeholder: "168" },
  { key: "weight", label: "Cân nặng", unit: "kg", placeholder: "55" },
  { key: "chest", label: "Vòng ngực", unit: "cm", placeholder: "86" },
  { key: "waist", label: "Vòng eo", unit: "cm", placeholder: "68" },
  { key: "hips", label: "Vòng mông", unit: "cm", placeholder: "90" },
  { key: "shoulder", label: "Vai rộng", unit: "cm", placeholder: "38" },
  { key: "armLength", label: "Dài tay", unit: "cm", placeholder: "58" },
  { key: "legLength", label: "Dài quần", unit: "cm", placeholder: "100" },
  { key: "neck", label: "Vòng cổ", unit: "cm", placeholder: "36" }, // Bổ sung hiển thị Vòng cổ
]

export function ProfileMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null) // Chuyển sang kiểu number theo id int4 trong DB
  
  const [formData, setFormData] = useState<Partial<Record<keyof Measurement, any>>>({
    name: "",
    height: "",
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    shoulder: "",
    armLength: "",
    legLength: "",
    neck: "",
    notes: "",
  })

  // Hàm fetch đồng bộ dữ liệu từ route.ts
  const fetchMeasurements = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/measurements")
      if (!res.ok) throw new Error("Lỗi tải dữ liệu")
      const data = await res.json()
      setMeasurements(data)
    } catch (error) {
      console.error("Lỗi lấy dữ liệu từ DB:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMeasurements()
  }, [])

  // Xử lý Thêm mới (POST) hoặc Cập nhật (PUT) dữ liệu
  const handleSave = async () => {
    if (!formData.name?.trim()) return

    const method = editingId ? "PUT" : "POST"
    const url = editingId ? `/api/measurements/${editingId}` : "/api/measurements"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await fetchMeasurements() // Cập nhật lại danh sách mới từ DB
        resetForm()
      } else {
        alert("Có lỗi xảy ra khi đồng bộ với máy chủ.")
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error)
    }
  }

  // Chuẩn bị đổ dữ liệu cũ vào Form để sửa
  const handleEdit = (measurement: Measurement) => {
    setEditingId(measurement.id)
    setFormData({
      name: measurement.name,
      height: measurement.height ?? "",
      weight: measurement.weight ?? "",
      chest: measurement.chest ?? "",
      waist: measurement.waist ?? "",
      hips: measurement.hips ?? "",
      shoulder: measurement.shoulder ?? "",
      armLength: measurement.armLength ?? "",
      legLength: measurement.legLength ?? "",
      neck: measurement.neck ?? "",
      notes: measurement.notes ?? "",
    })
    setIsDialogOpen(true)
  }

  // Gửi lệnh xóa (DELETE) lên API [id]/route.ts
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/measurements/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        await fetchMeasurements()
      } else {
        alert("Không thể xóa bộ số đo này.")
      }
    } catch (error) {
      console.error("Lỗi thực thi xóa dữ liệu:", error)
    }
  }

  // Đặt nhanh bộ số đo làm mặc định bằng nút Star nhanh trên Card
  const handleSetDefault = async (id: number) => {
    try {
      const res = await fetch(`/api/measurements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      })
      if (res.ok) {
        await fetchMeasurements()
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái mặc định:", error)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: "",
      height: "",
      weight: "",
      chest: "",
      waist: "",
      hips: "",
      shoulder: "",
      armLength: "",
      legLength: "",
      neck: "",
      notes: "",
    })
    setIsDialogOpen(false)
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(measurements, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "measurements_export.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        if (Array.isArray(imported)) {
          // Gửi dữ liệu tuần tự lên API để lưu thẳng vào DB
          for (const item of imported) {
            await fetch("/api/measurements", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            })
          }
          await fetchMeasurements()
          alert("Nhập dữ liệu thành công vào database!")
        }
      } catch {
        alert("Định dạng file không hợp lệ hoặc lỗi kết nối DB")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
          <Breadcrumb className="mb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/profile">Thông tin cá nhân</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Quản lý số đo</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Quản lý số đo
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Lưu trữ và đồng bộ hóa các bộ số đo cơ thể trực tiếp trên tài khoản của bạn
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={measurements.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Xuất
              </Button>
              <Label htmlFor="import" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Nhập
                  </span>
                </Button>
                <input
                  id="import"
                  type="file"
                  accept=".json"
                  className="sr-only"
                  onChange={handleImport}
                />
              </Label>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => resetForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm số đo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? "Chỉnh sửa số đo" : "Thêm số đo mới"}
                    </DialogTitle>
                    <DialogDescription>
                      Nhập thông tin chỉ số cơ thể của bạn (Lưu trữ trên Cloud Server)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Tên bộ số đo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="VD: Số đo mặc định"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {measurementFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={field.key}>{field.label}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id={field.key}
                              type="number"
                              step="0.1"
                              value={formData[field.key as keyof Measurement] || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [field.key]: e.target.value,
                                }))
                              }
                              placeholder={field.placeholder}
                            />
                            <span className="text-sm text-muted-foreground w-6">
                              {field.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Thêm trường Textarea nhập dữ liệu cho cột 'notes' trong DB */}
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="notes">Ghi chú thêm</Label>
                      <Textarea 
                        id="notes"
                        placeholder="Ví dụ: Số đo khi mặc corset nén form đồ cosplay..."
                        value={formData.notes || ""}
                        onChange={(e) => 
                          setFormData(prev => ({ ...prev, notes: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={resetForm}>
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!formData.name?.trim()}
                    >
                      Lưu lên hệ thống
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-sm text-muted-foreground animate-pulse">
              Đang đồng bộ số đo từ máy chủ database...
            </div>
          ) : measurements.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Ruler className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold">Chưa có dữ liệu số đo</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thêm bộ số đo đầu tiên để sử dụng khi kết nối luồng đặt may trang phục
                </p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm số đo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {measurements.map((measurement) => (
                <Card
                  key={measurement.id}
                  className={`border-border/60 transition-all flex flex-col justify-between ${
                    measurement.isDefault ? "border-primary/50 shadow-sm bg-primary/5" : ""
                  }`}
                >
                  <div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {measurement.name}
                          </CardTitle>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Cập nhật: {new Date(measurement.updatedAt || measurement.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        {measurement.isDefault && (
                          <Badge variant="secondary" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Star className="h-3 w-3 fill-current" />
                            Mặc định
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {measurementFields.map((field) => {
                          const value = measurement[field.key as keyof Measurement]
                          if (!value) return null
                          return (
                            <div key={field.key}>
                              <p className="text-xs text-muted-foreground">
                                {field.label}
                              </p>
                              <p className="font-medium">
                                {value} {field.unit}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Hiển thị Ghi chú (Notes) từ DB lên giao diện nếu có */}
                      {measurement.notes && (
                        <div className="text-xs border-t border-border/60 pt-2 text-muted-foreground italic">
                          <strong>Ghi chú:</strong> {measurement.notes}
                        </div>
                      )}
                    </CardContent>
                  </div>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(measurement)}
                      >
                        <Edit3 className="mr-2 h-3.5 w-3.5" />
                        Sửa
                      </Button>
                      {!measurement.isDefault && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => handleSetDefault(measurement.id)}
                              >
                                <Star className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Đặt làm mặc định</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa số đo này?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này sẽ xóa vĩnh viễn bộ số đo khỏi tài khoản của bạn trên cơ sở dữ liệu và không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(measurement.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Xóa vĩnh viễn
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Help Card */}
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  Cách đo chính xác phục vụ may Cosplay
                </p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• Đo khi mặc đồ lót mỏng sát cơ thể</li>
                  <li>• Thước dây ôm vừa vặn, không quá chặt hoặc lỏng</li>
                  <li>• Đứng thẳng người, thả lỏng tự nhiên, không gồng hoặc nín thở</li>
                  <li>• Hãy nhờ người khác đo hộ để lấy chính xác chiều dài tay, quần và vai rộng</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}