"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { Loader2 } from "lucide-react"

export function CheckoutForm() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên")
      return false
    }
    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email")
      return false
    }
    if (!formData.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại")
      return false
    }
    if (!formData.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ")
      return false
    }
    if (!formData.city.trim()) {
      toast.error("Vui lòng nhập thành phố")
      return false
    }
    if (!formData.district.trim()) {
      toast.error("Vui lòng nhập quận/huyện")
      return false
    }
    if (!formData.ward.trim()) {
      toast.error("Vui lòng nhập phường/xã")
      return false
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      toast.error("Số điện thoại không hợp lệ")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      // Mô phỏng xử lý thanh toán
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Thành công
      toast.success("Đơn hàng đã được đặt thành công!")

      // Xóa giỏ hàng
      clearCart()

      // Chuyển hướng đến trang xác nhận
      setTimeout(() => {
        router.push(
          `/checkout/confirmation?orderId=ORD-${Date.now()}&method=${paymentMethod}`
        )
      }, 1500)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.")
      setLoading(false)
    }
  }

  const shippingCost = items.length > 0 ? 35000 : 0
  const tax = Math.round(totalPrice * 0.1)
  const finalTotal = totalPrice + shippingCost + tax

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Nguyễn Văn A"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@gmail.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0912345678"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ chi tiết *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Số 123, Đường ABC"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Thành phố/Tỉnh *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="TP. Hồ Chí Minh"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="district">Quận/Huyện *</Label>
              <Input
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Quận 1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ward">Phường/Xã *</Label>
              <Input
                id="ward"
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                placeholder="Phường Bến Nghé"
                className="mt-1"
              />
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

        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="space-y-3">
            {/* COD */}
            <div className="flex cursor-pointer items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod" className="flex-1 cursor-pointer">
                <div className="font-semibold">
                  Thanh toán khi nhận hàng (COD)
                </div>
                <div className="text-sm text-muted-foreground">
                  Bạn sẽ thanh toán khi nhận đơn hàng
                </div>
              </Label>
            </div>

            {/* Bank Transfer */}
            <div className="flex cursor-pointer items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50">
              <RadioGroupItem value="bank" id="bank" />
              <Label htmlFor="bank" className="flex-1 cursor-pointer">
                <div className="font-semibold">Chuyển khoản ngân hàng</div>
                <div className="text-sm text-muted-foreground">
                  Chuyển tiền vào tài khoản của chúng tôi trước khi giao hàng
                </div>
              </Label>
            </div>

            {/* E-wallet */}
            <div className="flex cursor-pointer items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50">
              <RadioGroupItem value="ewallet" id="ewallet" />
              <Label htmlFor="ewallet" className="flex-1 cursor-pointer">
                <div className="font-semibold">Ví điện tử (Momo, ZaloPay)</div>
                <div className="text-sm text-muted-foreground">
                  Thanh toán nhanh chỉ với một cú chạm
                </div>
              </Label>
            </div>

            {/* Credit Card */}
            <div className="flex cursor-pointer items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex-1 cursor-pointer">
                <div className="font-semibold">Thẻ tín dụng / Debit card</div>
                <div className="text-sm text-muted-foreground">
                  Visa, Mastercard, hoặc các thẻ khác
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </Card>

      {/* Tóm tắt đơn hàng */}
      <Card className="bg-muted/50 p-6">
        <h2 className="text-xl font-bold text-foreground">Tóm tắt đơn hàng</h2>
        <Separator className="my-4" />

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Subtotal ({items.length} sản phẩm)
            </span>
            <span className="font-medium">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phí vận chuyển</span>
            <span className="font-medium">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(shippingCost)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Thuế (10%)</span>
            <span className="font-medium">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(tax)}
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between text-lg font-bold">
          <span>Tổng cộng</span>
          <span className="text-primary">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(finalTotal)}
          </span>
        </div>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || items.length === 0}
        size="lg"
        className="w-full rounded-full"
      >
        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
        {loading ? "Đang xử lý..." : "Hoàn tất đơn hàng"}
      </Button>

      {items.length === 0 && (
        <p className="text-center text-sm text-destructive">
          Giỏ hàng trống. Vui lòng thêm sản phẩm.
        </p>
      )}
    </form>
  )
}
