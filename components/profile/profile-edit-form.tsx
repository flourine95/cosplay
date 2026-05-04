"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

type User = {
  username?: string
  name: string
  email: string
  phone?: string
  gender?: string
  status?: string
  address?: string
}

export default function ProfileEditForm({ user }: { user: User }) {
  const [form, setForm] = useState<User>({ ...user })
  const [saving, setSaving] = useState(false)

  const onChange =
    (k: keyof User) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((s) => ({ ...s, [k]: e.target.value }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      // TODO: handle response / show toast
    } catch (err) {
      // TODO: show error
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <div className="rounded-md border border-border bg-secondary/30 p-4 sm:col-span-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Tên đăng nhập
        </h3>
        <Input
          className="mt-1 h-10"
          value={form.username ?? ""}
          onChange={onChange("username")}
        />
      </div>

      <div className="rounded-md border border-border bg-secondary/30 p-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Họ và tên
        </h3>
        <Input
          className="mt-1 h-10"
          value={form.name}
          onChange={onChange("name")}
        />
      </div>

      <div className="rounded-md border border-border bg-secondary/30 p-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Email</h3>
        <Input
          className="mt-1 h-10"
          value={form.email}
          onChange={onChange("email")}
          type="email"
        />
      </div>

      <div className="rounded-md border border-border bg-secondary/30 p-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Số điện thoại
        </h3>
        <Input
          className="mt-1 h-10"
          value={form.phone ?? ""}
          onChange={onChange("phone")}
        />
      </div>

      <div className="rounded-md border border-border bg-secondary/30 p-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Giới tính
        </h3>
        <div className="mt-2">
          <RadioGroup
            value={form.gender ?? ""}
            onValueChange={(v) => setForm((s) => ({ ...s, gender: v }))}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="Nam" id="gender-male" />
              <label htmlFor="gender-male" className="text-sm">
                Nam
              </label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem value="Nữ" id="gender-female" />
              <label htmlFor="gender-female" className="text-sm">
                Nữ
              </label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem value="Khác" id="gender-other" />
              <label htmlFor="gender-other" className="text-sm">
                Khác
              </label>
            </div>
          </RadioGroup>
        </div>
      </div>
      <div className="rounded-md border border-border bg-secondary/30 p-4 sm:col-span-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Địa chỉ</h3>
        <textarea
          className="mt-1 min-h-[4rem] w-full rounded-md border border-input bg-background px-3 py-2"
          value={form.address ?? ""}
          onChange={onChange("address")}
          rows={3}
        />
      </div>

      <div className="rounded-md border border-transparent p-4 sm:col-span-2">
        <Button className="w-full" type="submit" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  )
}
