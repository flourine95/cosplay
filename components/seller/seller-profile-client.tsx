"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import type { ReactNode } from "react"
import { CheckCircle2, Store, Truck, WalletCards } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

type SellerProfile = {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string | null
  shopName: string | null
  shopDescription: string | null
  shopLogo: string | null
  shopBanner: string | null
  shopReturnName: string | null
  shopReturnPhone: string | null
  shopReturnAddress: string | null
  shopReturnCity: string | null
  shopReturnDistrict: string | null
  shopReturnWard: string | null
  shopReturnNote: string | null
  businessLicense: string | null
  taxCode: string | null
  bankName: string | null
  bankAccount: string | null
  bankAccountName: string | null
  sellerStatus: string | null
  sellerRating: number
  sellerTotalReviews: number
  sellerTotalSales: number
}

const emptyProfile: SellerProfile = {
  id: 0,
  name: "",
  email: "",
  phone: "",
  avatar: "",
  shopName: "",
  shopDescription: "",
  shopLogo: "",
  shopBanner: "",
  shopReturnName: "",
  shopReturnPhone: "",
  shopReturnAddress: "",
  shopReturnCity: "",
  shopReturnDistrict: "",
  shopReturnWard: "",
  shopReturnNote: "",
  businessLicense: "",
  taxCode: "",
  bankName: "",
  bankAccount: "",
  bankAccountName: "",
  sellerStatus: null,
  sellerRating: 0,
  sellerTotalReviews: 0,
  sellerTotalSales: 0,
}

const placeholderReturnAddressValues = new Set([
  "Chưa cập nhật",
  "Địa chỉ shop chưa cập nhật",
  "Chua cap nhat",
  "Dia chi shop chua cap nhat",
])

const isFilled = (value: string | null) =>
  Boolean(value?.trim()) && !placeholderReturnAddressValues.has(value!.trim())

export function SellerProfileClient() {
  const [profile, setProfile] = useState<SellerProfile>(emptyProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/seller/profile")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Không thể tải hồ sơ seller")
      setProfile({ ...emptyProfile, ...json.data })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadProfile])

  const hasRequiredShopInfo = useMemo(
    () => isFilled(profile.name) && isFilled(profile.shopName),
    [profile.name, profile.shopName]
  )

  const hasReturnAddress = useMemo(
    () =>
      [
        profile.shopReturnName,
        profile.shopReturnPhone,
        profile.shopReturnAddress,
        profile.shopReturnCity,
        profile.shopReturnDistrict,
        profile.shopReturnWard,
      ].every(isFilled),
    [
      profile.shopReturnName,
      profile.shopReturnPhone,
      profile.shopReturnAddress,
      profile.shopReturnCity,
      profile.shopReturnDistrict,
      profile.shopReturnWard,
    ]
  )

  const updateField = (field: keyof SellerProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const submitProfile = () => {
    if (!hasRequiredShopInfo) {
      toast.error("Vui lòng nhập tên người đại diện và tên shop")
      return
    }

    startTransition(async () => {
      const res = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "Không thể cập nhật hồ sơ seller")
        return
      }
      setProfile({ ...emptyProfile, ...json.data })
      toast.success("Đã cập nhật hồ sơ seller")
    })
  }

  if (isLoading) return <Skeleton className="h-[560px] rounded-lg" />

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <Store className="h-5 w-5 text-primary" />
            <CardTitle>Thông tin shop</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Tên người đại diện" required>
              <Input
                value={profile.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </Field>
            <Field label="Email">
              <Input value={profile.email} disabled />
            </Field>
            <Field label="Số điện thoại">
              <Input
                value={profile.phone ?? ""}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="0901234567"
              />
            </Field>
            <Field label="Tên shop" required>
              <Input
                value={profile.shopName ?? ""}
                onChange={(event) =>
                  updateField("shopName", event.target.value)
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Mô tả shop">
                <Textarea
                  value={profile.shopDescription ?? ""}
                  onChange={(event) =>
                    updateField("shopDescription", event.target.value)
                  }
                  rows={4}
                  placeholder="Giới thiệu ngắn về shop, chất liệu, chính sách hỗ trợ..."
                />
              </Field>
            </div>
            <Field label="Avatar URL">
              <Input
                value={profile.avatar ?? ""}
                onChange={(event) => updateField("avatar", event.target.value)}
                placeholder="https://..."
              />
            </Field>
            <Field label="Logo shop URL">
              <Input
                value={profile.shopLogo ?? ""}
                onChange={(event) =>
                  updateField("shopLogo", event.target.value)
                }
                placeholder="https://..."
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Banner shop URL">
                <Input
                  value={profile.shopBanner ?? ""}
                  onChange={(event) =>
                    updateField("shopBanner", event.target.value)
                  }
                  placeholder="https://..."
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <Truck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Địa chỉ shop nhận đồ trả về</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Đơn thuê sẽ sao chép địa chỉ này để người thuê gửi trả đồ.
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Tên người nhận" required>
              <Input
                value={profile.shopReturnName ?? ""}
                onChange={(event) =>
                  updateField("shopReturnName", event.target.value)
                }
                placeholder="Cosplay Shop"
              />
            </Field>
            <Field label="Số điện thoại nhận trả đồ" required>
              <Input
                value={profile.shopReturnPhone ?? ""}
                onChange={(event) =>
                  updateField("shopReturnPhone", event.target.value)
                }
                placeholder="0901234567"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Địa chỉ chi tiết" required>
                <Input
                  value={profile.shopReturnAddress ?? ""}
                  onChange={(event) =>
                    updateField("shopReturnAddress", event.target.value)
                  }
                  placeholder="Số nhà, tên đường, tòa nhà..."
                />
              </Field>
            </div>
            <Field label="Tỉnh/Thành phố" required>
              <Input
                value={profile.shopReturnCity ?? ""}
                onChange={(event) =>
                  updateField("shopReturnCity", event.target.value)
                }
              />
            </Field>
            <Field label="Quận/Huyện" required>
              <Input
                value={profile.shopReturnDistrict ?? ""}
                onChange={(event) =>
                  updateField("shopReturnDistrict", event.target.value)
                }
              />
            </Field>
            <Field label="Phường/Xã" required>
              <Input
                value={profile.shopReturnWard ?? ""}
                onChange={(event) =>
                  updateField("shopReturnWard", event.target.value)
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Ghi chú trả đồ">
                <Textarea
                  value={profile.shopReturnNote ?? ""}
                  onChange={(event) =>
                    updateField("shopReturnNote", event.target.value)
                  }
                  rows={3}
                  placeholder="VD: Gọi trước khi gửi, kèm mã đơn thuê trên kiện hàng..."
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <WalletCards className="h-5 w-5 text-primary" />
            <CardTitle>Giấy tờ và thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Giấy phép kinh doanh">
              <Input
                value={profile.businessLicense ?? ""}
                onChange={(event) =>
                  updateField("businessLicense", event.target.value)
                }
              />
            </Field>
            <Field label="Mã số thuế">
              <Input
                value={profile.taxCode ?? ""}
                onChange={(event) => updateField("taxCode", event.target.value)}
              />
            </Field>
            <Field label="Ngân hàng">
              <Input
                value={profile.bankName ?? ""}
                onChange={(event) =>
                  updateField("bankName", event.target.value)
                }
              />
            </Field>
            <Field label="Số tài khoản">
              <Input
                value={profile.bankAccount ?? ""}
                onChange={(event) =>
                  updateField("bankAccount", event.target.value)
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Tên chủ tài khoản">
                <Input
                  value={profile.bankAccountName ?? ""}
                  onChange={(event) =>
                    updateField("bankAccountName", event.target.value)
                  }
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button disabled={isPending} onClick={submitProfile}>
            {isPending ? "Đang lưu..." : "Lưu hồ sơ"}
          </Button>
        </div>
      </div>

      <Card className="h-fit border-border/60">
        <CardHeader>
          <CardTitle>Tổng quan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Trạng thái</span>
            <Badge variant="secondary">{profile.sellerStatus ?? "N/A"}</Badge>
          </div>
          <StatusRow label="Thông tin shop" isComplete={hasRequiredShopInfo} />
          <StatusRow label="Địa chỉ trả đồ" isComplete={hasReturnAddress} />
          <Info
            label="Đánh giá"
            value={`${profile.sellerRating.toFixed(1)}/5`}
          />
          <Info
            label="Lượt đánh giá"
            value={String(profile.sellerTotalReviews)}
          />
          <Info label="Doanh số" value={String(profile.sellerTotalSales)} />
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  children,
  label,
  required = false,
}: {
  children: ReactNode
  label: string
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function StatusRow({
  label,
  isComplete,
}: {
  label: string
  isComplete: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant={isComplete ? "default" : "outline"} className="gap-1">
        {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
        {isComplete ? "Đầy đủ" : "Cần cập nhật"}
      </Badge>
    </div>
  )
}
