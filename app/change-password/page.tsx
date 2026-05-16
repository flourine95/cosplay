"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react"

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
import { useAuth } from "@/stores/auth-store"

export default function ChangePasswordPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") // từ forgot-password flow

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Nếu có token → reset password flow, không cần đăng nhập
  // Nếu không có token → đổi mật khẩu khi đã đăng nhập
  const isResetFlow = !!token
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }

    setIsLoading(true)

    const endpoint = isResetFlow
      ? "/api/auth/reset-password"
      : "/api/auth/change-password"

    const body = isResetFlow
      ? { token, password: newPassword, confirmPassword }
      : { currentPassword, newPassword, confirmPassword }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setIsLoading(false)

    if (!res.ok) {
      setError(data.error)
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
      imageTitle="Bảo vệ những đơn hàng và số đo cá nhân của bạn."
      trustItems={[
        {
          label: "Bảo vệ số đo",
          description: "Hồ sơ cá nhân và số đo cần được giữ an toàn.",
        },
        {
          label: "Giữ đơn hàng",
          description: "Quyền truy cập đơn mua, thuê và đặt may vẫn liền mạch.",
        },
        {
          label: "Link một lần",
          description: "Luồng reset chỉ dùng token đã gửi qua email.",
        },
        {
          label: "Cập nhật nhanh",
          description: "Đổi mật khẩu xong là quay lại hồ sơ hoặc đăng nhập.",
        },
      ]}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
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
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoFocus
                autoComplete="current-password"
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
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoFocus={isResetFlow}
              autoComplete="new-password"
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
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
        </div>

        <Button
          className="mt-1 h-11 w-full rounded-full text-base"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          {!isLoading && <ArrowRight data-icon="inline-end" />}
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
