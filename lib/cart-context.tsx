"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface CartItem {
  productSlug: string
  productName: string
  price: number
  quantity: number
  size: string
  type: "buy" | "rent"
  rentDays?: number
  image: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productSlug: string, size: string, type: "buy" | "rent") => void
  updateQuantity: (
    productSlug: string,
    size: string,
    type: "buy" | "rent",
    quantity: number
  ) => void
  clearCart: () => void
  totalPrice: number
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("cart")
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to load cart:", e)
      }
    }
    setMounted(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, mounted])

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) =>
          item.productSlug === newItem.productSlug &&
          item.size === newItem.size &&
          item.type === newItem.type
      )

      if (existingItem) {
        return prevItems.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }

      return [...prevItems, newItem]
    })
  }

  const removeItem = (
    productSlug: string,
    size: string,
    type: "buy" | "rent"
  ) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.productSlug === productSlug &&
            item.size === size &&
            item.type === type
          )
      )
    )
  }

  const updateQuantity = (
    productSlug: string,
    size: string,
    type: "buy" | "rent",
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeItem(productSlug, size, type)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productSlug === productSlug &&
        item.size === size &&
        item.type === type
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
