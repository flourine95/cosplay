"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CheckCircle2, Copy } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { CheckoutFormData } from "@/lib/schemas/checkout"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CheckoutFormProps {
  form: UseFormReturn<CheckoutFormData>
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  isSubmitting: boolean
  cartItemsCount: number
  showBankModal: boolean
  setShowBankModal: (show: boolean) => void
  createdOrderId: string | null
}

export function CheckoutForm({
  form,
  onSubmit,
  isSubmitting,
  cartItemsCount,
  showBankModal,
  setShowBankModal,
  createdOrderId,
}: CheckoutFormProps) {
  const router = useRouter()
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form
  const paymentMethod = watch("paymentMethod")

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Đã sao chép vào bộ nhớ tạm")
  }

  const handleBankConfirm = () => {
    setShowBankModal(false)
    if (createdOrderId) {
      router.push(
        `/checkout/confirmation?orderId=${createdOrderId}&method=bank_transfer`
      )
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Thông tin giao hàng */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground">
            Thông tin giao hàng
          </h2>
          <Separator className="my-4" />

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                className="mt-1"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  className="mt-1"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  placeholder="0912345678"
                  className="mt-1"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Địa chỉ chi tiết *</Label>
              <Input
                id="address"
                placeholder="Số 123, Đường ABC"
                className="mt-1"
                {...register("address")}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="city">Thành phố/Tỉnh *</Label>
                <Input
                  id="city"
                  placeholder="TP. Hồ Chí Minh"
                  className="mt-1"
                  {...register("city")}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="district">Quận/Huyện *</Label>
                <Input
                  id="district"
                  placeholder="Quận 1"
                  className="mt-1"
                  {...register("district")}
                />
                {errors.district && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.district.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="ward">Phường/Xã *</Label>
                <Input
                  id="ward"
                  placeholder="Phường Bến Nghé"
                  className="mt-1"
                  {...register("ward")}
                />
                {errors.ward && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.ward.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Phương thức thanh toán */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground">
            Phương thức thanh toán
          </h2>
          <Separator className="my-4" />

          <RadioGroup
            value={paymentMethod}
            onValueChange={(val: string) =>
              setValue(
                "paymentMethod",
                val as "cod" | "bank_transfer" | "e_wallet" | "credit_card",
                { shouldValidate: true }
              )
            }
          >
            <div className="space-y-3">
              {/* COD */}
              <div className="flex cursor-pointer items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-foreground">
                    Thanh toán khi nhận hàng (COD)
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Bạn sẽ thanh toán khi nhận đơn hàng
                  </div>
                </Label>
              </div>

              {/* Bank Transfer */}
              <div className="flex cursor-pointer items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label
                  htmlFor="bank_transfer"
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-semibold text-foreground">
                    Chuyển khoản ngân hàng
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Chuyển tiền vào tài khoản của chúng tôi trước khi giao hàng
                  </div>
                </Label>
              </div>

              {/* E-wallet */}
              <div className="flex cursor-pointer items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50">
                <RadioGroupItem value="e_wallet" id="e_wallet" />
                <Label htmlFor="e_wallet" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-foreground">
                    Ví điện tử (Momo, ZaloPay)
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Thanh toán nhanh chỉ với một cú chạm
                  </div>
                </Label>
              </div>

              {/* Credit Card */}
              <div className="flex cursor-pointer items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-foreground">
                    Thẻ tín dụng / Debit card
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Visa, Mastercard, hoặc các thẻ khác
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
          {errors.paymentMethod && (
            <p className="mt-2 text-xs text-destructive">
              {errors.paymentMethod.message}
            </p>
          )}
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || cartItemsCount === 0}
          size="lg"
          className="w-full rounded-full"
        >
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
        </Button>

        {cartItemsCount === 0 && (
          <p className="text-center text-sm text-destructive">
            Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ để tiếp tục thanh
            toán.
          </p>
        )}
      </form>

      {/* Bank Transfer Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-250 fade-in">
          <Card className="w-full max-w-md animate-in overflow-hidden bg-background p-6 shadow-2xl duration-250 zoom-in-95">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="mb-3 size-12 text-primary" />
              <h3 className="text-lg font-bold text-foreground">
                Thông tin chuyển khoản
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Vui lòng chuyển khoản đúng số tiền và nội dung bên dưới để hệ
                thống xác nhận đơn hàng tự động.
              </p>
            </div>

            <Separator className="my-5" />

            <div className="space-y-4 text-sm">
              <div className="space-y-3 rounded-xl bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Chủ tài khoản:
                  </span>
                  <span className="text-right text-xs font-semibold text-foreground">
                    CÔNG TY CỔ PHẦN COSPLAY VIỆT NAM
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-2">
                  <span className="text-xs text-muted-foreground">
                    Số tài khoản:
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span>1234567890</span>
                    <button
                      onClick={() => handleCopy("1234567890")}
                      className="p-1 text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-2">
                  <span className="text-xs text-muted-foreground">
                    Ngân hàng:
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    Vietcombank
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-2">
                  <span className="text-xs text-muted-foreground">
                    Nội dung chuyển khoản:
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-primary">
                    <span>{`COSPLAY ${createdOrderId || "ORD"}`}</span>
                    <button
                      onClick={() =>
                        handleCopy(`COSPLAY ${createdOrderId || "ORD"}`)
                      }
                      className="p-1 text-primary transition-colors hover:text-primary/80"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleBankConfirm}
              className="mt-6 w-full rounded-full"
              size="lg"
            >
              Tôi đã chuyển khoản
            </Button>
          </Card>
        </div>
      )}
    </>
  )
}
