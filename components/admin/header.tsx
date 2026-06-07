"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Logo - Always visible */}
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-extrabold tracking-tight text-primary">
              cosplay
            </span>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              .vn
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs font-semibold text-muted-foreground">
            Admin
          </span>
        </Link>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px]"
                >
                  5
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Thông báo hệ thống</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <p className="text-sm font-semibold">Seller mới đăng ký</p>
                  <p className="text-xs text-muted-foreground">
                    Wibu Shop vừa đăng ký tài khoản seller
                  </p>
                  <p className="text-xs text-muted-foreground">5 phút trước</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <p className="text-sm font-semibold">Báo cáo vi phạm</p>
                  <p className="text-xs text-muted-foreground">
                    User #1234 báo cáo sản phẩm không đúng mô tả
                  </p>
                  <p className="text-xs text-muted-foreground">1 giờ trước</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <p className="text-sm font-semibold">Yêu cầu rút tiền</p>
                  <p className="text-xs text-muted-foreground">
                    Cosplay Pro yêu cầu rút 10.000.000đ
                  </p>
                  <p className="text-xs text-muted-foreground">2 giờ trước</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <p className="text-sm font-semibold">Đơn hàng tranh chấp</p>
                  <p className="text-xs text-muted-foreground">
                    Đơn #DH-1024 đang trong trạng thái tranh chấp
                  </p>
                  <p className="text-xs text-muted-foreground">3 giờ trước</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <p className="text-sm font-semibold">Doanh thu vượt mốc</p>
                  <p className="text-xs text-muted-foreground">
                    Tổng doanh thu tháng này đã đạt 1 tỷ đồng
                  </p>
                  <p className="text-xs text-muted-foreground">5 giờ trước</p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-xs font-medium text-primary">
                Xem tất cả thông báo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline-block">
                  Admin System
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quản trị viên</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Thông tin tài khoản</DropdownMenuItem>
              <DropdownMenuItem>Cài đặt hệ thống</DropdownMenuItem>
              <DropdownMenuItem>Nhật ký hoạt động</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
