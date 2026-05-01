"use client"
import React, { useEffect, useState } from "react"
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
type OrderItem = { id: string; name: string; qty: number; price: number }
type Order = {
  id: string
  date: string
  total: number
  status: string
  items: OrderItem[]
}

const STORAGE_KEY = "orders"

const SAMPLE: Order[] = [
  {
    id: "ORD-1001",
    date: new Date().toISOString(),
    total: 129900,
    status: "Hoàn thành",
    items: [
      { id: "P1", name: "Váy cosplay A", qty: 1, price: 99900 },
      { id: "P2", name: "Phụ kiện B", qty: 1, price: 30000 },
    ],
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setOrders(JSON.parse(raw))
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  }, [orders])

  function importSample() {
    if (!confirm("Nhập đơn hàng mẫu vào lịch sử?")) return
    setOrders((prev) => [...SAMPLE, ...prev])
  }

  function viewDetails(o: Order) {
    alert(
      `Đơn ${o.id}\nTrạng thái: ${o.status}\nTổng: ${o.total}\n\n` +
        o.items.map((it) => `${it.name} x${it.qty} - ${it.price}`).join("\n")
    )
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="container mx-auto p-6">
        <Breadcrumb className="mb-8">
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
              <BreadcrumbPage>Lịch sử mua hàng</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mb-4 text-2xl font-semibold">Lịch sử mua hàng</h1>

        <div className="mb-4">
          <button
            onClick={importSample}
            className="rounded bg-blue-600 px-3 py-2 text-white"
          >
            Nhập đơn mẫu
          </button>
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có đơn hàng nào.</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <div className="font-medium">{o.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(o.date).toLocaleString()}
                  </div>
                  <div className="text-sm">
                    Tổng: {o.total} • Trạng thái: {o.status}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => viewDetails(o)}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  )
}
