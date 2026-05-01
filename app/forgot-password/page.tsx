import Link from "next/link"
import { ArrowRight, Mail, ShieldAlert } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Quên mật khẩu"
      description="Nhập email của bạn, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu trong vài phút."
      imageSrc="https://upload.wikimedia.org/wikipedia/commons/1/10/Cerisier_du_Japon_Prunus_serrulata.jpg"
      imageAlt="Không gian hậu trường chụp ảnh thời trang"
      imageLabel="Khôi phục tài khoản"
      imageTitle="Lấy lại quyền truy cập."
      stats={[
        { value: "3 phút", label: "gửi mail" },
        { value: "Bảo mật", label: "xác minh" },
      ]}
    >
      <form className="space-y-5">
        <div className="rounded-2xl border border-brand/20 bg-brand/8 px-4 py-3 text-sm text-brand-subtle-foreground">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              Chúng tôi chỉ cần email đã dùng để đăng ký. Nếu không thấy thư,
              hãy kiểm tra mục spam hoặc thử lại sau vài phút.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="forgot-email" className="text-sm text-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="forgot-email"
              type="email"
              placeholder="ban@cosplay.vn"
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        <Button className="h-11 w-full rounded-full text-base" asChild>
          <Link href="/change-password">
            Gửi liên kết đặt lại
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>

        <div className="flex items-center justify-between gap-3 text-sm">
          <Link
            href="/login"
            className="font-medium text-brand hover:text-brand/80"
          >
            Quay lại đăng nhập
          </Link>
          <Link
            href="/register"
            className="text-muted-foreground hover:text-foreground"
          >
            Tạo tài khoản mới
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}
