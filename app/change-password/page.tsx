import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ChangePasswordPage() {
  return (
    <AuthShell
      title="Đổi mật khẩu"
      description="Cập nhật mật khẩu để bảo vệ tài khoản của bạn sau khi đăng nhập hoặc sau khi xác minh email khôi phục."
      imageSrc="https://upload.wikimedia.org/wikipedia/commons/1/10/Cerisier_du_Japon_Prunus_serrulata.jpg"
      imageAlt="Người mẫu đứng trong không gian studio tối"
      imageLabel="Bảo mật tài khoản"
      imageTitle="Một mật khẩu mới, an toàn hơn cho tài khoản cosplay của bạn."
      stats={[
        { value: "12 ký tự", label: "khuyến nghị" },
        { value: "2 lớp", label: "bảo vệ" },
      ]}
    >
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="current-password" className="text-sm text-foreground">
            Mật khẩu hiện tại
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="current-password"
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-sm text-foreground">
            Mật khẩu mới
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="new-password"
              type="password"
              placeholder="Tạo mật khẩu mới"
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirm-new-password"
            className="text-sm text-foreground"
          >
            Xác nhận mật khẩu mới
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirm-new-password"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Mật khẩu mạnh nên có chữ hoa, chữ thường, số và ký tự đặc biệt để tăng
          độ an toàn cho tài khoản.
        </div>

        <Button className="h-11 w-full rounded-full text-base" asChild>
          <Link href="/login">
            Cập nhật mật khẩu
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Cần hỗ trợ?{" "}
          <Link href="/" className="font-medium text-brand hover:text-brand/80">
            Liên hệ shop
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
