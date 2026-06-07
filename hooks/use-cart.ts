"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  productSlug: string
  name: string
  image: string
  size: string
  type: "Mua" | "Thuê"
  rentDays?: number
  price: number
  quantity: number
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/cart")
      if (!res.ok) {
        throw new Error("Không thể kết nối API hoặc lấy dữ liệu giỏ hàng")
      }
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      const error = err as Error
      console.error("fetchCart error:", error)
      setError(error.message || "Đã xảy ra lỗi khi tải giỏ hàng")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart()
  }, [fetchCart])

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return

    // Optimistic update
    const previousItems = [...items]
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    )

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })

      if (!res.ok) {
        throw new Error("Không thể cập nhật số lượng trên máy chủ")
      }
    } catch (err) {
      const error = err as Error
      // Revert state if request fails
      setItems(previousItems)
      toast.error(error.message || "Lỗi cập nhật số lượng")
    }
  }

  const removeItem = async (itemId: string) => {
    const previousItems = [...items]
    const itemToRemove = items.find((item) => item.id === itemId)
    setItems((prev) => prev.filter((item) => item.id !== itemId))

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Không thể xóa sản phẩm khỏi máy chủ")
      }

      toast.success(
        itemToRemove
          ? `Đã xóa "${itemToRemove.name}" khỏi giỏ hàng`
          : "Đã xóa sản phẩm thành công"
      )
    } catch (err) {
      const error = err as Error
      // Revert state if request fails
      setItems(previousItems)
      toast.error(error.message || "Lỗi xóa sản phẩm")
    }
  }

  const clearCart = async () => {
    const previousItems = [...items]
    setItems([])

    try {
      const res = await fetch("/api/cart/all", {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Không thể xóa sạch giỏ hàng trên máy chủ")
      }

      toast.success("Đã xóa toàn bộ giỏ hàng thành công")
    } catch (err) {
      const error = err as Error
      // Revert state if request fails
      setItems(previousItems)
      toast.error(error.message || "Lỗi xóa toàn bộ giỏ hàng")
    }
  }

  const addItem = async (
    productSlug: string,
    size: string,
    type: "buy" | "rent",
    rentDays?: number,
    quantity = 1
  ) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          size,
          type,
          rentDays,
          quantity,
        }),
      })

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng")
        }
        const data = await res.json()
        throw new Error(data.error || "Không thể thêm sản phẩm vào giỏ hàng")
      }

      toast.success("Đã thêm sản phẩm vào giỏ hàng")
      await fetchCart() // Refresh cart items in state
      return true
    } catch (err) {
      const error = err as Error
      toast.error(error.message || "Lỗi thêm sản phẩm")
      return false
    }
  }

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    items,
    isLoading,
    error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
    totalPrice,
    totalItems,
  }
}
