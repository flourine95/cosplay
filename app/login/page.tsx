"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useForm } from "react-hook-form"

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
import { loginSchema, type LoginInput } from "@/schemas/auth"
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
        imageLabel: "Thanh toán an tâm",
      }
    : redirect.startsWith("/rental")
      ? {
          title: "Đăng nhập để giữ lịch thuê",
          description:
            "Lưu ngày thuê, theo dõi cọc và nhận cập nhật khi seller xác nhận trang phục.",
          imageLabel: "Lịch thuê minh bạch",
        }
      : redirect.startsWith("/custom-order")
        ? {
            title: "Đăng nhập để đặt may",
            description:
              "Lưu số đo, trao đổi yêu cầu với seller và theo dõi tiến độ may theo từng bước.",
            imageLabel: "Đặt may cá nhân",
          }
        : {
            title: "Đăng nhập",
            description:
              "Truy cập tài khoản để quản lý hoạt động mua bán, cho thuê và đặt may của bạn.",
            imageLabel: "Chào mừng trở lại",
          }

  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleLogin = async (data: LoginInput) => {
    const result = await login(data)

    if (result.error) {
      setError("root", { message: result.error })
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
    >
      <form className="space-y-5" onSubmit={handleSubmit(handleLogin)}>
        {errors.root?.message && (
          <Alert id="login-error" variant="destructive" className="rounded-xl">
            <AlertCircle />
            <AlertDescription>
              {errors.root.message}{" "}
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
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email || errors.root ? "login-error" : undefined
              }
              required
              autoFocus
              autoComplete="email"
              {...register("email")}
            />
          </InputGroup>
          {errors.email?.message && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
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
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password || errors.root ? "login-error" : undefined
              }
              required
              autoComplete="current-password"
              {...register("password")}
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
          {errors.password?.message && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
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
          {!errors.root?.message && (
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
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          {!isSubmitting && <ArrowRight data-icon="inline-end" />}
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
