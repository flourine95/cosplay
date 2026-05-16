"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/stores/auth-store"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")
  const redirect =
    redirectParam?.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/"
  const authContext = redirect.startsWith("/checkout")
    ? {
        title: "Đăng nhập để thanh toán",
        description:
          "Tiếp tục checkout, lưu địa chỉ giao hàng và theo dõi trạng thái thanh toán trong một nơi.",
        imageTitle: "Hoàn tất đơn hàng mà không mất giỏ đồ.",
        imageLabel: "Thanh toán an tâm",
      }
    : redirect.startsWith("/rental")
      ? {
          title: "Đăng nhập để giữ lịch thuê",
          description:
            "Lưu ngày thuê, theo dõi cọc và nhận cập nhật khi seller xác nhận trang phục.",
          imageTitle: "Giữ lịch thuê rõ ràng trước ngày sự kiện.",
          imageLabel: "Lịch thuê minh bạch",
        }
      : redirect.startsWith("/custom-order")
        ? {
            title: "Đăng nhập để đặt may",
            description:
              "Lưu số đo, trao đổi yêu cầu với seller và theo dõi tiến độ may theo từng bước.",
            imageTitle: "Theo dõi số đo, báo giá và tiến độ may.",
            imageLabel: "Đặt may cá nhân",
          }
        : {
            title: "Đăng nhập",
            description:
              "Truy cập tài khoản để quản lý hoạt động mua bán, cho thuê và đặt may của bạn.",
            imageTitle: "Đăng nhập để tiếp tục.",
            imageLabel: "Chào mừng trở lại",
          }

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <AuthShell
      title={authContext.title}
      description={authContext.description}
      imageSrc="/auth-bg.jpg"
      imageAlt="Không gian chụp ảnh trang phục cosplay"
      imageLabel={authContext.imageLabel}
      imageTitle={authContext.imageTitle}
      trustItems={[
        {
          label: "Theo dõi cọc",
          description: "Kiểm tra trạng thái thanh toán và hoàn cọc rõ ràng.",
        },
        {
          label: "Giữ lịch thuê",
          description: "Ngày nhận và trả đồ được lưu cùng đơn thuê.",
        },
        {
          label: "Lưu số đo",
          description: "Dùng lại hồ sơ số đo cho các đơn đặt may sau.",
        },
        {
          label: "Cập nhật đơn",
          description: "Theo dõi mua, thuê và đặt may trong cùng tài khoản.",
        },
      ]}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <Alert id="login-error" variant="destructive" className="rounded-xl">
            <AlertCircle />
            <AlertDescription>
              {error}{" "}
              <Link
                href="/forgot-password"
                className="font-medium underline underline-offset-2"
              >
                Quên mật khẩu?
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="login-email" className="text-sm text-foreground">
            Email
          </Label>
          <InputGroup className="h-11 rounded-xl bg-background">
            <InputGroupAddon>
              <Mail />
            </InputGroupAddon>
            <InputGroupInput
              id="login-email"
              type="email"
              placeholder="ban@cosplay.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={error ? "login-error" : undefined}
              required
              autoFocus
              autoComplete="email"
            />
          </InputGroup>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password" className="text-sm text-foreground">
            Mật khẩu
          </Label>
          <InputGroup className="h-11 rounded-xl bg-background">
            <InputGroupAddon>
              <Lock />
            </InputGroupAddon>
            <InputGroupInput
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={error ? "login-error" : undefined}
              required
              autoComplete="current-password"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <label
            htmlFor="remember-me"
            className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
            title="Giữ đăng nhập trong 30 ngày"
          >
            <Checkbox id="remember-me" />
            <span>
              Ghi nhớ đăng nhập{" "}
              <span className="text-xs text-muted-foreground/60">
                (30 ngày)
              </span>
            </span>
          </label>
          {!error && (
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Quên mật khẩu?
            </Link>
          )}
        </div>

        <Button
          className="mt-1 h-11 w-full rounded-full text-base"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          {!isLoading && <ArrowRight data-icon="inline-end" />}
        </Button>

        <p className="pt-1 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary/80"
          >
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
