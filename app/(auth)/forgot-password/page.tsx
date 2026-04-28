import Link from "next/link"
import {
  LuMail,
  LuArrowRight,
  LuShieldAlert,
  LuRefreshCcw,
} from "react-icons/lu"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Quên mật khẩu - Cosplay.vn",
  description: "Khôi phục quyền truy cập tài khoản bằng email đã đăng ký",
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      badge="Khôi phục tài khoản"
      title="Lấy lại quyền truy cập chỉ trong vài bước"
      description="Nhập email đã đăng ký, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu vào hộp thư của bạn."
      highlights={[
        "Quy trình gọn: nhập email, nhận mã, đặt mật khẩu mới.",
        "Liên kết khôi phục có hiệu lực trong thời gian ngắn để tăng bảo mật.",
      ]}
      stats={[
        { value: "3 bước", label: "khôi phục tài khoản" },
        { value: "5 phút", label: "hết hạn link" },
        { value: "24/7", label: "hỗ trợ tự động" },
      ]}
      panelLabel="Quy trình an toàn"
      panelTitle="Tập trung vào tốc độ nhưng vẫn giữ lớp xác thực rõ ràng"
      panelDescription="Màn hình này nên cho người dùng thấy ngay việc cần làm tiếp theo, giảm bối rối khi họ không nhớ mật khẩu cũ."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Đã nhớ mật khẩu?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Quay lại đăng nhập
          </Link>
        </p>
      }
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Quên mật khẩu
        </p>
        <h2 className="text-3xl font-black tracking-tight text-foreground">
          Nhập email để nhận hướng dẫn
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Chúng tôi sẽ gửi liên kết khôi phục đến địa chỉ email bạn đã dùng khi
          đăng ký.
        </p>
      </div>

      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email tài khoản</Label>
          <div className="relative">
            <LuMail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="forgot-email"
              type="email"
              placeholder="name@example.com"
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
          <div className="flex items-start gap-3">
            <LuShieldAlert className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Lưu ý bảo mật
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Nếu không thấy email trong hộp thư đến, hãy kiểm tra mục spam
                hoặc thư quảng cáo.
              </p>
            </div>
          </div>
        </div>

        <Button className="w-full rounded-full" size="lg">
          Gửi liên kết khôi phục
          <LuArrowRight data-icon="inline-end" />
        </Button>
      </form>

      <div className="space-y-4">
        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <LuRefreshCcw className="size-4 text-primary" />
            Có thể gửi lại yêu cầu sau 60 giây
          </span>
          <Link
            href="/reset-password"
            className="font-medium text-primary hover:underline"
          >
            Tôi đã có mã xác thực
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}
