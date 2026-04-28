import Link from "next/link"
import { LuLock, LuMail, LuKeyRound, LuShieldCheck } from "react-icons/lu"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Đổi mật khẩu - Cosplay.vn",
  description: "Đặt mật khẩu mới để hoàn tất khôi phục tài khoản",
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      badge="Đặt lại mật khẩu"
      title="Tạo mật khẩu mới cho tài khoản của bạn"
      description="Nhập mã xác thực và mật khẩu mới để hoàn tất quá trình khôi phục."
      highlights={[
        "Mật khẩu mới nên có ít nhất 8 ký tự để tăng mức an toàn.",
        "Sau khi đổi mật khẩu, các phiên đăng nhập cũ sẽ được yêu cầu đăng nhập lại.",
      ]}
      stats={[
        { value: "OTP", label: "xác minh một lần" },
        { value: "AES", label: "lớp bảo vệ dữ liệu" },
        { value: "0 rủi ro", label: "không lưu mật khẩu cũ" },
      ]}
      panelLabel="Xác thực bảo mật"
      panelTitle="Một bước cuối để khôi phục tài khoản đúng cách"
      panelDescription="Trang này nên cho người dùng thấy rõ trạng thái xác thực và hành động kế tiếp, tránh để họ lẫn giữa quên mật khẩu và đổi mật khẩu."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Chưa nhận được mã?{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Gửi lại email khôi phục
          </Link>
        </p>
      }
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Đổi mật khẩu
        </p>
        <h2 className="text-3xl font-black tracking-tight text-foreground">
          Nhập mã xác thực và mật khẩu mới
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Mã xác thực đã được gửi về email của bạn. Hãy hoàn tất thao tác trong
          thời gian còn hiệu lực.
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email tài khoản</Label>
          <div className="relative">
            <LuMail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reset-email"
              type="email"
              placeholder="name@example.com"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reset-code">Mã xác thực</Label>
          <div className="relative">
            <LuKeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reset-code"
              inputMode="numeric"
              placeholder="6 chữ số"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">Mật khẩu mới</Label>
          <div className="relative">
            <LuLock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="new-password"
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-new-password">Xác nhận mật khẩu mới</Label>
          <div className="relative">
            <LuLock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirm-new-password"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
          <div className="flex items-start gap-3">
            <LuShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Lớp xác thực cuối cùng
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Sau khi xác nhận, bạn sẽ được chuyển thẳng về trang đăng nhập để
                sử dụng mật khẩu mới.
              </p>
            </div>
          </div>
        </div>

        <Button className="w-full rounded-full" size="lg">
          Đổi mật khẩu
        </Button>
      </form>

      <div className="space-y-4">
        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          Muốn quay lại bước đầu?{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Nhập lại email khôi phục
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
