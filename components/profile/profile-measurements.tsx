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

type Measurement = {
  id: string
  name: string
  date: string
  isDefault: boolean
  height: string
  weight: string
  bust: string
  waist: string
  hips: string
  shoulder: string
  armLength: string
  legLength: string
}

const STORAGE_KEY = "measurements"

const measurementFields = [
  { key: "height", label: "Chiều cao", unit: "cm", placeholder: "168" },
  { key: "weight", label: "Cân nặng", unit: "kg", placeholder: "55" },
  { key: "bust", label: "Vòng ngực", unit: "cm", placeholder: "86" },
  { key: "waist", label: "Vòng eo", unit: "cm", placeholder: "68" },
  { key: "hips", label: "Vòng mông", unit: "cm", placeholder: "90" },
  { key: "shoulder", label: "Vai rộng", unit: "cm", placeholder: "38" },
  { key: "armLength", label: "Dài tay", unit: "cm", placeholder: "58" },
  { key: "legLength", label: "Dài quần", unit: "cm", placeholder: "100" },
]

// Helper to load from localStorage
const loadMeasurements = (): Measurement[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error("Failed to load measurements:", e)
    }
  }
  return []
}

export function ProfileMeasurements() {
  const [measurements, setMeasurements] =
    useState<Measurement[]>(loadMeasurements)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Measurement>>({
    name: "",
    height: "",
    weight: "",
    bust: "",
    waist: "",
    hips: "",
    shoulder: "",
    armLength: "",
    legLength: "",
  })

  // Save to localStorage whenever measurements change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(measurements))
  }, [measurements])

  const handleSave = () => {
    if (!formData.name?.trim()) return

    const newId = editingId || crypto.randomUUID()
    const measurement: Measurement = {
      id: newId,
      name: formData.name,
      date: new Date().toISOString(),
      isDefault: measurements.length === 0, // First one is default
      height: formData.height || "",
      weight: formData.weight || "",
      bust: formData.bust || "",
      waist: formData.waist || "",
      hips: formData.hips || "",
      shoulder: formData.shoulder || "",
      armLength: formData.armLength || "",
      legLength: formData.legLength || "",
    }

    if (editingId) {
      setMeasurements((prev) =>
        prev.map((m) => (m.id === editingId ? measurement : m))
      )
    } else {
      setMeasurements((prev) => [measurement, ...prev])
    }

    resetForm()
  }

  const handleEdit = (measurement: Measurement) => {
    setEditingId(measurement.id)
    setFormData(measurement)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id))
  }

  const handleSetDefault = (id: string) => {
    setMeasurements((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    )
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: "",
      height: "",
      weight: "",
      bust: "",
      waist: "",
      hips: "",
      shoulder: "",
      armLength: "",
      legLength: "",
    })
    setIsDialogOpen(false)
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(measurements, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "measurements.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        if (Array.isArray(imported)) {
          setMeasurements((prev) => [...imported, ...prev])
        }
      } catch {
        alert("File không hợp lệ")
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
                <BreadcrumbLink href="/profile">
                  Thông tin cá nhân
                </BreadcrumbLink>
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
                Lưu và quản lý các bộ số đo cơ thể của bạn
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
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
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? "Chỉnh sửa số đo" : "Thêm số đo mới"}
                    </DialogTitle>
                    <DialogDescription>
                      Nhập thông tin số đo cơ thể của bạn
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Tên bộ số đo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
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
                              value={
                                (formData[
                                  field.key as keyof typeof formData
                                ] as string) || ""
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [field.key]: e.target.value,
                                }))
                              }
                              placeholder={field.placeholder}
                            />
                            <span className="text-sm text-muted-foreground">
                              {field.unit}
                            </span>
                          </div>
                        </div>
                      ))}
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
                      Lưu
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
          {measurements.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Ruler className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold">Chưa có số đo nào</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thêm bộ số đo đầu tiên để sử dụng khi đặt may
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
                  className={`border-border/60 transition-all ${
                    measurement.isDefault ? "border-primary/50 shadow-sm" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {measurement.name}
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(measurement.date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                      {measurement.isDefault && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          Mặc định
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {measurementFields.map((field) => {
                        const value =
                          measurement[field.key as keyof Measurement]
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
                    <div className="flex items-center gap-2">
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
                              Bạn không thể hoàn tác hành động này. Số đo sẽ bị
                              xóa vĩnh viễn.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(measurement.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Xóa
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
                  Cách đo chính xác
                </p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• Đo khi mặc đồ lót mỏng</li>
                  <li>• Thước dây không quá chặt hoặc lỏng</li>
                  <li>• Đứng thẳng, thả lỏng tự nhiên</li>
                  <li>• Nhờ người khác đo để chính xác hơn</li>
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
