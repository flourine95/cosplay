"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { checkoutSchema, CheckoutFormData } from "@/lib/schemas/checkout"
import { useAuth } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { CartItem } from "@/hooks/use-cart"

export function useCheckout() {
  const router = useRouter()
  const { user } = useAuth()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBankModal, setShowBankModal] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  const fetchCartItems = useCallback(async () => {
    try {
      setIsLoadingCart(true)
      const res = await fetch("/api/cart")
      if (res.ok) {
        const data = await res.json()
        setCartItems(data.items || [])
      }
    } catch (error) {
      console.error("Error fetching cart items for checkout:", error)
    } finally {
      setIsLoadingCart(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCartItems()
  }, [fetchCartItems])

  // React Hook Form setup
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      ward: "",
      paymentMethod: "cod",
    },
  })

  // Autofill user info and address
  useEffect(() => {
    if (user) {
      form.setValue("fullName", user.name || "")
      form.setValue("email", user.email || "")
      form.setValue("phone", user.phone || "")

      if (user.savedAddresses) {
        try {
          const addresses =
            typeof user.savedAddresses === "string"
              ? JSON.parse(user.savedAddresses)
              : user.savedAddresses

          if (Array.isArray(addresses) && addresses.length > 0) {
            const defaultAddr =
              addresses.find((a: { isDefault?: boolean }) => a.isDefault) ||
              addresses[0]
            if (defaultAddr) {
              form.setValue("fullName", defaultAddr.name || user.name || "")
              form.setValue("phone", defaultAddr.phone || user.phone || "")
              form.setValue("address", defaultAddr.address || "")
              form.setValue("city", defaultAddr.city || "")
              form.setValue("district", defaultAddr.district || "")
              form.setValue("ward", defaultAddr.ward || "")
            }
          }
        } catch (e) {
          console.error("Error parsing saved addresses:", e)
        }
      }
    }
  }, [user, form])

  const onSubmit = async (data: CheckoutFormData) => {
    if (cartItems.length === 0) {
      toast.error(
        "Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán."
      )
      return
    }

    setIsSubmitting(true)
    try {
      const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      const shippingCost = 35000
      const totalAmount = totalPrice + shippingCost

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: cartItems,
          totalAmount,
        }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        toast.error(responseData.error || "Có lỗi xảy ra khi tạo đơn hàng.")
        setIsSubmitting(false)
        return
      }

      toast.success("Đặt hàng thành công!")
      setCreatedOrderId(responseData.orderId)

      // Handle payment routing based on method
      if (data.paymentMethod === "cod") {
        router.push(
          `/checkout/confirmation?orderId=${responseData.orderId}&method=cod`
        )
      } else if (data.paymentMethod === "bank_transfer") {
        setShowBankModal(true)
      } else if (responseData.paymentUrl) {
        // Momo/ZaloPay or Credit card redirect
        window.location.assign(responseData.paymentUrl)
      } else {
        router.push(
          `/checkout/confirmation?orderId=${responseData.orderId}&method=${data.paymentMethod}`
        )
      }
    } catch (error) {
      console.error("Checkout submission error:", error)
      toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const shippingCost = cartItems.length > 0 ? 35000 : 0
  const finalTotal = totalPrice + shippingCost

  return {
    form,
    cartItems,
    isLoadingCart,
    isSubmitting,
    showBankModal,
    setShowBankModal,
    createdOrderId,
    onSubmit: form.handleSubmit(onSubmit),
    totalPrice,
    shippingCost,
    finalTotal,
  }
}
