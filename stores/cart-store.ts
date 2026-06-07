import { create } from "zustand"
import { persist } from "zustand/middleware"

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

interface CartStore {
  items: CartItem[]
  totalPrice: number
  totalItems: number
  addItem: (item: CartItem) => void
  removeItem: (productSlug: string, size: string, type: "buy" | "rent") => void
  updateQuantity: (
    productSlug: string,
    size: string,
    type: "buy" | "rent",
    quantity: number
  ) => void
  clearCart: () => void
}

function computeTotals(items: CartItem[]) {
  return {
    totalPrice: items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totalPrice: 0,
      totalItems: 0,

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (item) =>
              item.productSlug === newItem.productSlug &&
              item.size === newItem.size &&
              item.type === newItem.type
          )

          const items = existing
            ? state.items.map((item) =>
                item === existing
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              )
            : [...state.items, newItem]

          return { items, ...computeTotals(items) }
        }),

      removeItem: (productSlug, size, type) =>
        set((state) => {
          const items = state.items.filter(
            (item) =>
              !(
                item.productSlug === productSlug &&
                item.size === size &&
                item.type === type
              )
          )
          return { items, ...computeTotals(items) }
        }),

      updateQuantity: (productSlug, size, type, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const items = state.items.filter(
              (item) =>
                !(
                  item.productSlug === productSlug &&
                  item.size === size &&
                  item.type === type
                )
            )
            return { items, ...computeTotals(items) }
          }

          const items = state.items.map((item) =>
            item.productSlug === productSlug &&
            item.size === size &&
            item.type === type
              ? { ...item, quantity }
              : item
          )
          return { items, ...computeTotals(items) }
        }),

      clearCart: () => set({ items: [], totalPrice: 0, totalItems: 0 }),
    }),
    {
      name: "cart",
    }
  )
)
