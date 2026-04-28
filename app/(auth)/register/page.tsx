import Link from "next/link"
import { LuMail, LuLock, LuUser, LuPhone, LuSparkles } from "react-icons/lu"
import { SiFacebook, SiGoogle } from "react-icons/si"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Đăng ký - Cosplay.vn",
  description:
    "Tạo tài khoản mới để lưu bộ cosplay yêu thích và đặt hàng nhanh hơn",
}

export default function RegisterPage() {
  return (
    <AuthShell
      badge="Tạo tài khoản"
      title="Gia nhập cộng đồng cosplay theo cách gọn gàng nhất"
      description="Một tài khoản giúp bạn lưu mẫu yêu thích, theo dõi đơn hàng và nhận gợi ý trang phục phù hợp phong cách cá nhân."
      highlights={[
        "Lưu danh sách yêu thích và xem lại bất kỳ lúc nào.",
        "Theo dõi trạng thái đơn, lịch thuê và lịch may trong một nơi.",
      ]}
      stats={[
        { value: "1 phút", label: "khởi tạo tài khoản" },
        { value: "100%", label: "đồng bộ thiết bị" },
        { value: "Miễn phí", label: "không phí duy trì" },
      ]}
      panelLabel="Tài khoản cá nhân"
      panelTitle="Khởi tạo hồ sơ của bạn để nhận đề xuất đúng gu hơn"
      panelDescription="Luồng đăng ký được giữ tối giản, nhưng vẫn đủ thông tin để hệ thống gợi ý nhân vật, bộ sưu tập và dịch vụ phù hợp từng người dùng."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
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
          Đăng ký
        </p>
        <h2 className="text-3xl font-black tracking-tight text-foreground">
          Tạo tài khoản mới
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Điền thông tin bên dưới để bắt đầu trải nghiệm mua, thuê và đặt may.
        </p>
      </div>

      <form className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="register-name">Họ và tên</Label>
            <div className="relative">
              <LuUser className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-name"
                placeholder="Nguyễn Văn A"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-phone">Số điện thoại</Label>
            <div className="relative">
              <LuPhone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-phone"
                placeholder="0900 000 000"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <div className="relative">
            <LuMail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-email"
              type="email"
              placeholder="name@example.com"
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="register-password">Mật khẩu</Label>
            <div className="relative">
              <LuLock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-password"
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-confirm-password">Xác nhận mật khẩu</Label>
            <div className="relative">
              <LuLock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-confirm-password"
                type="password"
                placeholder="Nhập lại mật khẩu"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/35 px-4 py-3">
          <Checkbox id="terms" className="mt-0.5" />
          <Label
            htmlFor="terms"
            className="cursor-pointer text-sm leading-6 text-foreground"
          >
            Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của
            Cosplay.vn.
          </Label>
        </div>

        <Button className="w-full rounded-full" size="lg">
          <LuSparkles />
          Tạo tài khoản
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
