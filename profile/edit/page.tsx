"use client"

import React from "react"
import ProfileEditForm from "@/components/profile/profile-edit-form"
import { Card, CardContent } from "@/components/ui/card"

export default function Page() {
  // demo user data — replace with server data or fetch as needed
  const user = {
    username: "nguyen123",
    name: "Nguyen Van A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
    gender: "Nam",
    status: "Hoạt động",
    address: "123 Đường A, Quận B, TP. HCM",
    avatarUrl: undefined,
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-semibold">
        Chỉnh sửa thông tin cá nhân
      </h1>

      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <ProfileEditForm user={user} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
