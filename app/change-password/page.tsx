"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react"
import { useForm, useWatch } from "react-hook-form"

import { AuthShell } from "@/components/auth/auth-shell"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import type { ChangePasswordInput, ResetPasswordInput } from "@/schemas/auth"
import { changePasswordSchema, resetPasswordSchema } from "@/schemas/auth"
import { useAuth } from "@/stores/auth-store"

type PasswordFormInput = ResetPasswordInput | ChangePasswordInput

export default function ChangePasswordPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") // từ forgot-password flow

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Nếu có token → reset password flow, không cần đăng nhập
  // Nếu không có token → đổi mật khẩu khi đã đăng nhập
  const isResetFlow = !!token
  const passwordFieldName = isResetFlow ? "password" : "newPassword"
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormInput>({
    resolver: zodResolver(
      isResetFlow ? resetPasswordSchema : changePasswordSchema
    ),
    defaultValues: isResetFlow
      ? { token: token ?? "", password: "", confirmPassword: "" }
      : { currentPassword: "", newPassword: "", confirmPassword: "" },
  })
  const newPassword =
    (useWatch({
      control,
      name: passwordFieldName as keyof PasswordFormInput,
    }) as string) ?? ""
  const confirmPassword =
    (useWatch({
      control,
      name: "confirmPassword" as keyof PasswordFormInput,
    }) as string) ?? ""
  const passwordChecks = [
    { label: "Ít nhất 8 ký tự", valid: newPassword.length >= 8 },
    {
      label: "Có ít nhất 1 chữ hoa",
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: "Có ít nhất 1 số",
      valid: /\d/.test(newPassword),
    },
    {
      label: "Xác nhận trùng khớp",
      valid: !!confirmPassword && newPassword === confirmPassword,
    },
  ]

  const handlePasswordSubmit = async (body: PasswordFormInput) => {
    const endpoint = isResetFlow
      ? "/api/auth/reset-password"
      : "/api/auth/change-password"

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      setError("root", { message: data.error })
      return
    }

    router.push(isResetFlow ? "/login" : "/profile")
    router.refresh()
  }

  return (
    <AuthShell
      title={isResetFlow ? "Đặt lại mật khẩu" : "Đổi mật khẩu"}
      description={
        isResetFlow
          ? "Tạo mật khẩu mới cho tài khoản của bạn. Link đặt lại chỉ dùng một lần."
          : "Cập nhật mật khẩu để bảo vệ hồ sơ, lịch thuê và đơn hàng của bạn."
      }
      imageSrc="/auth-bg.jpg"
      imageAlt="Không gian bảo quản và chuẩn bị trang phục cosplay"
      imageLabel="Bảo mật tài khoản"
    >
      <form className="space-y-5" onSubmit={handleSubmit(handlePasswordSubmit)}>
        {errors.root?.message && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertCircle />
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        {!isResetFlow && (
          <div className="space-y-1.5">
            <Label
              htmlFor="current-password"
              className="text-sm text-foreground"
            >
              Mật khẩu hiện tại
            </Label>
            <InputGroup className="h-11 rounded-xl bg-background">
              <InputGroupAddon>
                <Lock />
              </InputGroupAddon>
              <InputGroupInput
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu hiện tại"
                aria-invalid={"currentPassword" in errors}
                required
                autoFocus
                autoComplete="current-password"
                {...register("currentPassword" as keyof PasswordFormInput)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label={
                    showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                  }
                  onClick={() => setShowCurrentPassword((value) => !value)}
                >
                  {showCurrentPassword ? <EyeOff /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {"currentPassword" in errors && errors.currentPassword?.message && (
              <p className="text-xs text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="new-password" className="text-sm text-foreground">
            Mật khẩu mới
          </Label>
          <InputGroup className="h-11 rounded-xl bg-background">
            <InputGroupAddon>
              <Lock />
            </InputGroupAddon>
            <InputGroupInput
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="Tạo mật khẩu mới"
              aria-invalid={passwordFieldName in errors}
              required
              autoFocus={isResetFlow}
              autoComplete="new-password"
              {...register(passwordFieldName as keyof PasswordFormInput)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowNewPassword((value) => !value)}
              >
                {showNewPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {passwordFieldName in errors &&
            errors[passwordFieldName as keyof PasswordFormInput]?.message && (
              <p className="text-xs text-destructive">
                {
                  errors[passwordFieldName as keyof PasswordFormInput]
                    ?.message as string
                }
              </p>
            )}
          {newPassword.length > 0 && (
            <ul className="grid gap-1.5 pt-1" aria-label="Yêu cầu mật khẩu">
              {passwordChecks.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 text-xs"
                  aria-label={`${item.label}: ${item.valid ? "đạt" : "chưa đạt"}`}
                >
                  {item.valid ? (
                    <CheckCircle2
                      className="size-3.5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className="size-3.5 shrink-0 text-muted-foreground/40"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={
                      item.valid ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="confirm-new-password"
            className="text-sm text-foreground"
          >
            Xác nhận mật khẩu mới
          </Label>
          <InputGroup className="h-11 rounded-xl bg-background">
            <InputGroupAddon>
              <Lock />
            </InputGroupAddon>
            <InputGroupInput
              id="confirm-new-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              aria-invalid={"confirmPassword" in errors}
              required
              autoComplete="new-password"
              {...register("confirmPassword" as keyof PasswordFormInput)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label={
                  showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                }
                onClick={() => setShowConfirmPassword((value) => !value)}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {"confirmPassword" in errors && errors.confirmPassword?.message && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          className="mt-1 h-11 w-full rounded-full text-base"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          {!isSubmitting && <ArrowRight data-icon="inline-end" />}
        </Button>

        <p className="pt-1 text-center text-sm text-muted-foreground">
          {user ? (
            <Link
              href="/profile"
              className="font-medium text-primary hover:text-primary/80"
            >
              Quay lại hồ sơ
            </Link>
          ) : (
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              Quay lại đăng nhập
            </Link>
          )}
        </p>
      </form>
    </AuthShell>
  )
}
