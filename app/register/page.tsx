"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Mail,
  ShoppingBag,
  Store,
  User,
} from "lucide-react"
import { useForm, useWatch } from "react-hook-form"

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
import { cn } from "@/lib/utils"
import { registerSchema, type RegisterInput } from "@/schemas/auth"
import { useAuth } from "@/stores/auth-store"

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const {
    register: registerField,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
      agreed: false,
    },
  })
  const password = useWatch({ control, name: "password" }) ?? ""
  const confirmPassword = useWatch({ control, name: "confirmPassword" }) ?? ""
  const accountType = useWatch({ control, name: "role" })
  const agreed = useWatch({ control, name: "agreed" })

  const passwordChecks = [
    { label: "Ít nhất 8 ký tự", valid: password.length >= 8 },
    {
      label: "Có ít nhất 1 chữ hoa",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Có ít nhất 1 số",
      valid: /\d/.test(password),
    },
    {
      label: "Xác nhận trùng khớp",
      valid: !!confirmPassword && password === confirmPassword,
    },
  ]

  const handleRegister = async (input: RegisterInput) => {
    const result = await register(input)

    if (result.error) {
      setError("root", { message: result.error })
      return
    }

    router.push(accountType === "SELLER" ? "/seller" : "/")
    router.refresh()
  }

  const isSeller = accountType === "SELLER"

  return (
    <AuthShell
      title={isSeller ? "Trở thành người bán" : "Trở thành người mua"}
      description={
        isSeller
          ? "Tạo tài khoản để đăng sản phẩm, quản lý lịch thuê và nhận yêu cầu đặt may từ khách hàng."
          : "Tạo tài khoản để lưu địa chỉ giao hàng, theo dõi đơn và nhận ưu đãi riêng cho khách hàng mới."
      }
      imageSrc="/auth-bg.jpg"
      imageAlt="Không gian chuẩn bị trang phục cosplay"
      imageLabel="Tạo tài khoản mới"
    >
      <form className="space-y-5" onSubmit={handleSubmit(handleRegister)}>
        {errors.root?.message && (
          <Alert
            id="register-error"
            variant="destructive"
            className="rounded-xl"
          >
            <AlertCircle />
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* Account type — role="group" để screen reader hiểu đây là nhóm lựa chọn */}
        <div role="group" aria-label="Loại tài khoản">
          <p className="mb-2 text-sm font-medium text-foreground">
            Bạn muốn làm gì trên cosplay.vn?
          </p>
          <div className="flex flex-col gap-2">
            {[
              {
                value: "CUSTOMER" as const,
                title: "Mua, thuê hoặc đặt may",
                description:
                  "Tìm và mua trang phục, thuê theo ngày, hoặc đặt may theo số đo riêng.",
                icon: ShoppingBag,
              },
              {
                value: "SELLER" as const,
                title: "Bán, cho thuê hoặc nhận may",
                description:
                  "Đăng sản phẩm để bán hoặc cho thuê, nhận đơn đặt may từ khách hàng. Tài khoản cần được duyệt trước khi hoạt động.",
                icon: Store,
              },
            ].map((option) => {
              const Icon = option.icon
              const isSelected = accountType === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setValue("role", option.value, { shouldValidate: true })
                  }
                  className={cn(
                    "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-[oklch(0.95_0.06_70)]"
                      : "border-border bg-background hover:bg-muted/50"
                  )}
                  aria-pressed={isSelected}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm leading-snug font-semibold",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {option.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
          {errors.role?.message && (
            <p className="mt-1 text-xs text-destructive">
              {errors.role.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm text-foreground">
            Họ và tên
          </Label>
          <InputGroup className="h-11 rounded-xl bg-background">
            <InputGroupAddon>
              <User />
            </InputGroupAddon>
            <InputGroupInput
              id="name"
              placeholder="Nguyễn Văn A"
              aria-invalid={!!errors.name}
              required
              autoFocus
              autoComplete="name"
              {...registerField("name")}
            />
          </InputGroup>
          {errors.name?.message && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-email" className="text-sm text-foreground">
            Email
          </Label>
          <InputGroup className="h-11 rounded-xl bg-background">
            <InputGroupAddon>
              <Mail />
            </InputGroupAddon>
            <InputGroupInput
              id="register-email"
              type="email"
              placeholder="ban@cosplay.vn"
              aria-invalid={!!errors.email}
              required
              autoComplete="email"
              {...registerField("email")}
            />
          </InputGroup>
          {errors.email?.message && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="register-password"
            className="text-sm text-foreground"
          >
            Mật khẩu
          </Label>
          <InputGroup className="h-11 rounded-xl bg-background">
            <InputGroupAddon>
              <Lock />
            </InputGroupAddon>
            <InputGroupInput
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Tạo mật khẩu"
              aria-invalid={!!errors.password}
              required
              autoComplete="new-password"
              {...registerField("password")}
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
          {password.length > 0 && (
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
                      className="size-3.5 shrink-0 text-muted-foreground/60"
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
          <Label htmlFor="confirm-password" className="text-sm text-foreground">
            Xác nhận mật khẩu
          </Label>
          <InputGroup className="h-11 rounded-xl bg-background">
            <InputGroupAddon>
              <Lock />
            </InputGroupAddon>
            <InputGroupInput
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              aria-invalid={!!errors.confirmPassword}
              required
              autoComplete="new-password"
              {...registerField("confirmPassword")}
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
          {errors.confirmPassword?.message && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <label
          htmlFor="terms"
          className="flex cursor-pointer items-start gap-2 text-sm text-foreground"
        >
          <Checkbox
            id="terms"
            className="mt-0.5"
            checked={agreed}
            onCheckedChange={(value) =>
              setValue("agreed", value === true, { shouldValidate: true })
            }
          />
          <span>
            Tôi đồng ý với{" "}
            <Link
              href="/terms"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              điều khoản
            </Link>{" "}
            và chính sách bảo mật.
          </span>
        </label>
        {errors.agreed?.message && (
          <p className="text-xs text-destructive">{errors.agreed.message}</p>
        )}

        <Button
          className="mt-1 h-11 w-full rounded-full text-base"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          {!isSubmitting && <ArrowRight data-icon="inline-end" />}
        </Button>

        <p className="pt-1 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
