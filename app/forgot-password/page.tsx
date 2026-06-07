"use client"

import Link from "next/link"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from "lucide-react"
import { useForm } from "react-hook-form"

import { AuthShell } from "@/components/auth/auth-shell"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const handleForgotPassword = async (input: ForgotPasswordInput) => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    const data = await res.json()

    if (!res.ok) {
      setError("root", { message: data.error })
      return
    }

    setSentEmail(input.email)
    setSent(true)
  }

  return (
    <AuthShell
      title="Quên mật khẩu"
      description="Nhập email của bạn, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu trong vài phút."
      imageSrc="/auth-bg.jpg"
      imageAlt="Không gian hậu trường chuẩn bị trang phục cosplay"
      imageLabel="Khôi phục tài khoản"
    >
      {sent ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-brand-subtle px-6 py-8 text-center">
            <CheckCircle2 className="size-10 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Đã gửi email!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Kiểm tra hộp thư <strong>{sentEmail}</strong> để lấy link đặt
                lại mật khẩu. Link có hiệu lực trong 1 giờ.
              </p>
            </div>
          </div>
          <Button asChild className="h-11 w-full rounded-full">
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={handleSubmit(handleForgotPassword)}
        >
          {errors.root?.message && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle />
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="forgot-email" className="text-sm text-foreground">
              Email đã đăng ký
            </Label>
            <InputGroup className="h-11 rounded-xl bg-background">
              <InputGroupAddon>
                <Mail />
              </InputGroupAddon>
              <InputGroupInput
                id="forgot-email"
                type="email"
                placeholder="ban@cosplay.vn"
                aria-invalid={!!errors.email}
                required
                autoFocus
                autoComplete="email"
                {...register("email")}
              />
            </InputGroup>
            {errors.email?.message && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Không thấy thư? Kiểm tra mục spam hoặc thử lại sau vài phút.
            </p>
          </div>

          <Button
            className="h-11 w-full rounded-full text-base"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi liên kết đặt lại"}
            {!isSubmitting && <ArrowRight data-icon="inline-end" />}
          </Button>

          <div className="flex items-center justify-between gap-3 pt-1 text-sm">
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
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
      )}
    </AuthShell>
  )
}
