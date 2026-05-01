import Link from "next/link"
import { ArrowRight, Mail, Lock, User } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <AuthShell
      title="Đăng ký"
      description="Tạo tài khoản để lưu địa chỉ giao hàng, theo dõi đơn và nhận ưu đãi riêng cho khách hàng mới."
      imageSrc="https://upload.wikimedia.org/wikipedia/commons/1/10/Cerisier_du_Japon_Prunus_serrulata.jpg"
      imageAlt="Mẫu cosplay với ánh sáng điện ảnh"
      imageLabel="Tạo tài khoản mới"
      imageTitle="Tạo tài khoản trong vài bước."
      stats={[
        { value: "7 ngày", label: "đổi trả" },
        { value: "100%", label: "đồng bộ" },
      ]}
    >
      <form className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first-name" className="text-sm text-foreground">
              Họ
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="first-name"
                placeholder="Nguyễn"
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name" className="text-sm text-foreground">
              Tên
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="last-name"
                placeholder="An"
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-sm text-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-email"
              type="email"
              placeholder="ban@cosplay.vn"
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="register-password"
            className="text-sm text-foreground"
          >
            Mật khẩu
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-password"
              type="password"
              placeholder="Tạo mật khẩu"
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm text-foreground">
            Xác nhận mật khẩu
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirm-password"
              type="password"
              placeholder="Nhập lại mật khẩu"
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox id="terms" className="mt-0.5" />
          <span>
            Tôi đồng ý với{" "}
            <Link href="/" className="font-medium text-brand">
              điều khoản
            </Link>{" "}
            và chính sách bảo mật của shop.
          </span>
        </label>

        <Button className="h-11 w-full rounded-full text-base" asChild>
          <Link href="/">
            Tạo tài khoản
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>

        <p className="pt-2 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-medium text-brand hover:text-brand/80"
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
