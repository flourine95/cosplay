"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
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

export function SellerProfileClient() {
  const [profile, setProfile] = useState<SellerProfile>(emptyProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/seller/profile")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Khong the tai ho so seller")
      setProfile({ ...emptyProfile, ...json.data })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Co loi xay ra")
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

  const updateField = (field: keyof SellerProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const submitProfile = () => {
    startTransition(async () => {
      const res = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "Khong the cap nhat ho so seller")
        return
      }
      setProfile({ ...emptyProfile, ...json.data })
      toast.success("Da cap nhat ho so seller")
    })
  }

  if (isLoading) return <Skeleton className="h-[560px] rounded-xl" />

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Thông tin shop</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Tên người đại diện">
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
              />
            </Field>
            <Field label="Tên shop">
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
                />
              </Field>
            </div>
            <Field label="Avatar URL">
              <Input
                value={profile.avatar ?? ""}
                onChange={(event) => updateField("avatar", event.target.value)}
              />
            </Field>
            <Field label="Logo shop URL">
              <Input
                value={profile.shopLogo ?? ""}
                onChange={(event) =>
                  updateField("shopLogo", event.target.value)
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Banner shop URL">
                <Input
                  value={profile.shopBanner ?? ""}
                  onChange={(event) =>
                    updateField("shopBanner", event.target.value)
                  }
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Giấy tờ & thanh toán</CardTitle>
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
            Lưu hồ sơ
          </Button>
        </div>
      </div>

      <Card className="h-fit border-border/60">
        <CardHeader>
          <CardTitle>Tổng quan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Trạng thái</span>
            <Badge variant="secondary">{profile.sellerStatus ?? "N/A"}</Badge>
          </div>
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
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
