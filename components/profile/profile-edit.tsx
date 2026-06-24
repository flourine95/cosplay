"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Mail, Phone, Save, Upload, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/home/footer"
import { Navbar } from "@/components/home/navbar"
import { getDefaultAddress, parseSavedAddresses } from "@/lib/profile"

type ProfileResponse = {
  user: {
    name: string
    email: string
    phone: string | null
    avatar: string | null
    savedAddresses: unknown
  }
}

type ProfileFormState = {
  name: string
  email: string
  phone: string
  avatar: string
  addressId?: string
  addressName: string
  addressPhone: string
  addressLine: string
  addressCity: string
  addressDistrict: string
  addressWard: string
}

type FormErrors = {
  name?: string
  email?: string
  phone?: string
  address?: string
}

export function ProfileEdit() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [data, setData] = useState<ProfileResponse | null>(null)
  const [formData, setFormData] = useState<ProfileFormState | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile")
        const json = await res.json()

        if (!mounted) return

        if (!res.ok) {
          setData(null)
          setFormData(null)
          return
        }

        setData(json)

        const savedAddresses = parseSavedAddresses(json.user.savedAddresses)
        const defaultAddress = getDefaultAddress(json.user.savedAddresses)

        setFormData({
          name: json.user.name || "",
          email: json.user.email || "",
          phone: json.user.phone || "",
          avatar: json.user.avatar || "",
          addressId: defaultAddress?.id || savedAddresses[0]?.id,
          addressName: defaultAddress?.name || json.user.name || "",
          addressPhone: defaultAddress?.phone || json.user.phone || "",
          addressLine: defaultAddress?.address || "",
          addressCity: defaultAddress?.city || "",
          addressDistrict: defaultAddress?.district || "",
          addressWard: defaultAddress?.ward || "",
        })
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [])

  const validate = () => {
    if (!formData) return false

    const nextErrors: FormErrors = {}
    if (!formData.name.trim()) nextErrors.name = "Vui lòng nhập họ tên"
    if (!formData.email.trim()) nextErrors.email = "Vui lòng nhập email"
    if (!formData.phone.trim()) nextErrors.phone = "Vui lòng nhập số điện thoại"
    if (!formData.addressName.trim() || !formData.addressLine.trim()) {
      nextErrors.address = "Vui lòng nhập địa chỉ mặc định"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData || !validate()) return

    setIsSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          avatar: formData.avatar,
          defaultAddress: {
            id: formData.addressId,
            name: formData.addressName,
            phone: formData.addressPhone || formData.phone,
            address: formData.addressLine,
            city: formData.addressCity,
            district: formData.addressDistrict,
            ward: formData.addressWard,
            isDefault: true,
          },
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        const message = json.error || "Không thể cập nhật hồ sơ"
        setErrors((prev) => ({
          ...prev,
          email: message.includes("Email") ? message : prev.email,
        }))
        return
      }

      router.push("/profile")
      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return

    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) =>
        prev ? { ...prev, avatar: reader.result as string } : prev
      )
    }
    reader.readAsDataURL(file)
  }

  if (isLoading || !formData) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-24 text-sm text-muted-foreground md:px-6">
            Đang tải biểu mẫu hồ sơ...
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 px-4 py-24 text-center md:px-6">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Chưa đăng nhập
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Bạn cần đăng nhập trước khi cập nhật hồ sơ cá nhân.
            </p>
            <Button asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-5 md:px-6">
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
                <BreadcrumbPage>Chỉnh sửa</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Chỉnh sửa thông tin
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Cập nhật thông tin cá nhân của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                      {formData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-muted">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm font-medium">Tải ảnh lên</span>
                      </div>
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarChange}
                      />
                    </Label>
                    <p className="mt-2 text-xs text-muted-foreground">
                      JPG, PNG hoặc WebP. Tối đa 2MB.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Họ và tên <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData((prev) => (prev ? { ...prev, name: value } : prev))
                        if (value.trim()) {
                          setErrors((prev) => ({ ...prev, name: undefined }))
                        }
                      }}
                      className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData((prev) => (prev ? { ...prev, email: value } : prev))
                        if (value.trim()) {
                          setErrors((prev) => ({ ...prev, email: undefined }))
                        }
                      }}
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      placeholder="email@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Số điện thoại <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData((prev) => (prev ? { ...prev, phone: value } : prev))
                        if (value.trim()) {
                          setErrors((prev) => ({ ...prev, phone: undefined }))
                        }
                      }}
                      className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
                      placeholder="0123 456 789"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Địa chỉ mặc định</Label>
                  <div className="grid gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address-name">Tên người nhận</Label>
                      <Input
                        id="address-name"
                        value={formData.addressName}
                        onChange={(e) =>
                          setFormData((prev) =>
                            prev ? { ...prev, addressName: e.target.value } : prev
                          )
                        }
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-phone">Số điện thoại</Label>
                      <Input
                        id="address-phone"
                        value={formData.addressPhone}
                        onChange={(e) =>
                          setFormData((prev) =>
                            prev ? { ...prev, addressPhone: e.target.value } : prev
                          )
                        }
                        placeholder="0123 456 789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-city">Tỉnh/Thành phố</Label>
                      <Input
                        id="address-city"
                        value={formData.addressCity}
                        onChange={(e) =>
                          setFormData((prev) =>
                            prev ? { ...prev, addressCity: e.target.value } : prev
                          )
                        }
                        placeholder="Hồ Chí Minh"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-district">Quận/Huyện</Label>
                      <Input
                        id="address-district"
                        value={formData.addressDistrict}
                        onChange={(e) =>
                          setFormData((prev) =>
                            prev ? { ...prev, addressDistrict: e.target.value } : prev
                          )
                        }
                        placeholder="Quận 1"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address-line">Địa chỉ cụ thể</Label>
                      <div className="relative">
                        <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="address-line"
                          value={formData.addressLine}
                          onChange={(e) =>
                            setFormData((prev) =>
                              prev ? { ...prev, addressLine: e.target.value } : prev
                            )
                          }
                          className="min-h-[96px] resize-none pl-10"
                          placeholder="Số nhà, đường, phường/xã"
                        />
                      </div>
                    </div>
                  </div>
                  {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" type="button" asChild>
                <Link href="/profile">Hủy</Link>
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
