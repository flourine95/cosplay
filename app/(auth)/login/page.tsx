import Link from "next/link"
import { LuMail, LuLock, LuShieldCheck } from "react-icons/lu"
import { SiFacebook, SiGoogle } from "react-icons/si"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Đăng nhập - Cosplay.vn",
  description: "Đăng nhập để quản lý đơn hàng và trải nghiệm cá nhân của bạn",
}

export default function LoginPage() {
  return (
    <AuthShell
      badge="Đăng nhập an toàn"
      title="Chào mừng quay lại với Cosplay.vn"
      description="Tiếp tục theo dõi đơn hàng, lưu danh sách yêu thích và đặt may nhanh hơn với tài khoản của bạn."
      highlights={[
        "Lưu giỏ hàng và lịch sử mua, thuê, đặt may trên mọi thiết bị.",
        "Nhận ưu đãi riêng theo bộ sưu tập bạn quan tâm nhiều nhất.",
      ]}
      stats={[
        { value: "500+", label: "mẫu cosplay" },
        { value: "24h", label: "hỗ trợ đơn hàng" },
        { value: "7 ngày", label: "đổi trả linh hoạt" },
      ]}
      panelLabel="Cổng truy cập"
      panelTitle="Một lần đăng nhập, theo dõi toàn bộ hành trình cosplay"
      panelDescription="Giao diện được thiết kế để người dùng nhìn thấy ngay lợi ích chính: quản lý đơn, lưu mẫu, và mua lại nhanh chỉ với vài thao tác."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Tạo tài khoản mới
          </Link>
        </p>
      }
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Đăng nhập
        </p>
        <h2 className="text-3xl font-black tracking-tight text-foreground">
          Nhập thông tin tài khoản
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Sử dụng email hoặc số điện thoại đã đăng ký để vào tài khoản.
        </p>
      </div>

      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email hoặc số điện thoại</Label>
          <div className="relative">
            <LuMail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
              type="text"
              placeholder="name@example.com"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="login-password">Mật khẩu</Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <LuLock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/35 px-4 py-3">
          <div className="flex items-center gap-3">
            <Checkbox id="remember-me" />
            <Label
              htmlFor="remember-me"
              className="cursor-pointer text-sm text-foreground"
            >
              Ghi nhớ đăng nhập
            </Label>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <LuShieldCheck className="size-3.5 text-primary" />
            Bảo mật 2 lớp
          </span>
        </div>

        <Button className="w-full rounded-full" size="lg">
          Đăng nhập
        </Button>
      </form>

      <div className="space-y-4">
        <Separator />
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" className="rounded-full" size="lg">
            <SiGoogle />
            Google
          </Button>
          <Button variant="outline" className="rounded-full" size="lg">
            <SiFacebook />
            Facebook
          </Button>
        </div>
      </div>
    </AuthShell>
  )
}
