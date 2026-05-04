"use client"

import React from "react"
import ProfileEditForm from "@/components/profile/profile-edit-form"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/home/navbar"
import { AnnouncementBar } from "@/components/home/announcement-bar"
import { Footer } from "@/components/home/footer"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

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
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="container mx-auto p-6">
        <Breadcrumb className="mb-8 text-muted-foreground">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/profile">Thông tin cá nhân</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chỉnh sửa thông tin cá nhân</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mb-6 text-2xl font-semibold">
          Chỉnh sửa thông tin cá nhân
        </h1>

        <div className="mx-auto max-w-4xl">
          <Card className="border-border bg-card/90">
            <CardContent className="p-6">
              <ProfileEditForm user={user} />
            </CardContent>
          </Card>
        </div>
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/profile/measurements"
            className="block rounded-lg bg-blue-600 p-4 shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
          >
            <h2 className="text-lg font-medium text-white">Quản lý số đo</h2>
            <p className="text-sm text-blue-100">
              Lưu và chỉnh sửa số đo của bạn
            </p>
          </Link>
          <Link
            href="/profile/orders"
            className="block rounded-lg border border-border bg-green-600 p-4 transition-all hover:border-primary hover:bg-green-600"
          >
            <h1 className="text-lg font-bold text-white">Lịch sử mua hàng</h1>
            <p className="text-sm text-blue-100">
              Xem các đơn hàng trước đây của bạn
            </p>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
