# Patterns

Code patterns thực tế trong dự án — TypeScript, React, data fetching, state management, API routes.

## Mục lục

- [TypeScript Patterns](#typescript-patterns)
- [Zod Validation](#zod-validation)
- [React Patterns](#react-patterns)
- [Data Fetching (React Query)](#data-fetching-react-query)
- [State Management (Zustand)](#state-management-zustand)
- [API Routes](#api-routes)
- [Authentication](#authentication)

---

## TypeScript Patterns

### Dùng Prisma Generated Types

Luôn import types từ Prisma cho database models — không tạo lại:

```typescript
import type { User, Product, Order } from "@/app/generated/prisma/client"
import { Prisma } from "@/app/generated/prisma/client"
```

### Prisma Type Utilities

```typescript
// Omit sensitive fields
type UserPublic = Omit<User, "password">

// Pick specific fields
type UserBasic = Pick<User, "id" | "name" | "email">

// Type với relations
const userWithOrders = {
  include: { orders: true },
} satisfies Prisma.UserDefaultArgs
type UserWithOrders = Prisma.UserGetPayload<typeof userWithOrders>

// Type với select
const userSelect = {
  select: { id: true, email: true },
} satisfies Prisma.UserDefaultArgs
type UserSelected = Prisma.UserGetPayload<typeof userSelect>
```

### Custom Types

Chỉ tạo custom types cho API contracts và UI-only types trong `types/`:

```typescript
// types/api.ts
import type { User } from "@/app/generated/prisma/client"

export type ApiResponse<T = unknown> = {
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type UserPublic = Omit<User, "password">
```

### Tránh `any`

```typescript
❌ Bad
const data: any = fetchData()

✅ Good
const data: User[] = fetchData()

// Nếu thật sự không biết type
const data: unknown = fetchData()
if (data && typeof data === 'object' && 'id' in data) { ... }
```

### Null/Undefined Handling

```typescript
// Optional chaining
const name = user?.profile?.name

// Nullish coalescing
const displayName = user?.name ?? "Khách"

// Early return
if (!user) return null
```

### Function Types

Dùng arrow functions, có return type rõ ràng:

```typescript
✅ Good
const getUserById = (id: number): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } })
}

❌ Bad — thiếu return type, dùng function declaration
function getUserById(id) {
  return prisma.user.findUnique({ where: { id } })
}
```

---

## Zod Validation

### Zod v4 — Những thay đổi quan trọng

```typescript
// ✅ Zod v4
z.email({ error: "Email không hợp lệ" })
z.url({ error: "URL không hợp lệ" })
z.uuid({ error: "UUID không hợp lệ" })

// ❌ Zod v3 (không dùng)
z.string().email({ message: "Email không hợp lệ" })
z.string().url({ message: "URL không hợp lệ" })
```

Custom errors dùng `{ error: '...' }`, **không phải** `{ message: '...' }`.
Ngoại lệ: `.refine()` vẫn dùng `message`:

```typescript
.refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})
```

### Schema Example

```typescript
// schemas/auth.ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.email({ error: "Email không hợp lệ" }),
  password: z.string().min(8, { error: "Mật khẩu phải có ít nhất 8 ký tự" }),
})

export const registerSchema = z.object({
  name: z.string().min(2, { error: "Tên phải có ít nhất 2 ký tự" }),
  email: z.email({ error: "Email không hợp lệ" }),
  password: z
    .string()
    .min(8, { error: "Mật khẩu phải có ít nhất 8 ký tự" })
    .regex(/[a-zA-Z]/, { error: "Mật khẩu phải chứa ít nhất 1 chữ cái" })
    .regex(/[0-9]/, { error: "Mật khẩu phải chứa ít nhất 1 số" }),
})

// Infer type từ schema
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

### Validate trong API Route

```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    )
  }

  const { email, password } = parsed.data
  // ...
}
```

---

## React Patterns

### Component Definition

```typescript
// ✅ Arrow function với typed props
interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return <div>...</div>
}

// ❌ Function declaration, props không destructure
export function ProductCard(props: ProductCardProps) {
  return <div>{props.product.name}</div>
}
```

### Event Handlers

Prefix với `handle`:

```typescript
✅ Good
const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); ... }
const handleClick = () => { ... }

❌ Bad
const onSubmit = () => {}
const click = () => {}
const submitForm = () => {}
```

### Conditional Rendering

```typescript
✅ Good
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{items.length > 0 ? <ItemList items={items} /> : <EmptyState />}

❌ Bad
{isLoading ? <Spinner /> : null}
{error ? <ErrorMessage error={error} /> : <></>}
```

### Custom Hooks

Prefix với `use`, đặt trong `hooks/` nếu dùng ở nhiều nơi:

```typescript
// hooks/use-debounce.ts
export const useDebounce = <T>(value: T, delay = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

---

## Data Fetching (React Query)

Project dùng `@tanstack/react-query` cho server state. **Không dùng SWR.**

### Setup (đã có sẵn)

```typescript
// providers/query-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

### useQuery — Fetch data

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

const useProducts = (categoryId?: number) => {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: async () => {
      const url = categoryId ? `/api/products?category=${categoryId}` : '/api/products'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json() as Promise<Product[]>
    },
  })
}

// Dùng trong component
export const ProductList = ({ categoryId }: { categoryId?: number }) => {
  const { data: products, isLoading, error } = useProducts(categoryId)

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage />

  return (
    <div className="grid grid-cols-3 gap-4">
      {products?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### useMutation — Create/Update/Delete

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query"

const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create product")
      return res.json()
    },
    onSuccess: () => {
      // Invalidate để refetch danh sách
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

// Dùng trong component
const { mutate: createProduct, isPending } = useCreateProduct()

const handleSubmit = (data: CreateProductInput) => {
  createProduct(data, {
    onSuccess: () => toast.success("Tạo sản phẩm thành công"),
    onError: (error) => toast.error(error.message),
  })
}
```

### Server Component — Fetch trực tiếp

Trong Server Components, fetch trực tiếp qua Prisma, không cần React Query:

```typescript
// app/products/page.tsx
import { prisma } from '@/lib/prisma'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  })

  return <ProductList products={products} />
}
```

---

## State Management (Zustand)

### Auth Store

```typescript
// stores/auth-store.ts
import { create } from "zustand"

export const useAuth = create<AuthStore>()((set) => ({
  user: null,
  isLoading: true,

  refresh: async () => {
    const res = await fetch("/api/auth/me")
    if (res.ok) {
      const data = await res.json()
      set({ user: data.user })
    } else {
      set({ user: null })
    }
  },

  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }
    set({ user: data.user })
    return {}
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    set({ user: null })
  },
}))
```

### Cart Store (với persist)

```typescript
// stores/cart-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (item) =>
              item.productSlug === newItem.productSlug &&
              item.size === newItem.size
          )
          const items = existing
            ? state.items.map((item) =>
                item === existing
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              )
            : [...state.items, newItem]
          return { items }
        }),
      clearCart: () => set({ items: [] }),
    }),
    { name: "cart" } // localStorage key
  )
)
```

### Dùng store trong component

```typescript
// Client component
'use client'

import { useAuth } from '@/stores/auth-store'
import { useCart } from '@/stores/cart-store'

export const Header = () => {
  const { user, logout } = useAuth()
  const { items } = useCart()

  return (
    <header>
      <span>{items.length} items</span>
      {user ? (
        <button onClick={logout}>{user.name}</button>
      ) : (
        <a href="/login">Đăng nhập</a>
      )}
    </header>
  )
}
```

---

## API Routes

### Response Format

Dùng nhất quán `NextResponse.json()`:

```typescript
import { NextResponse } from "next/server"

// Success
return NextResponse.json({ data: result })
return NextResponse.json({ data: result }, { status: 201 })

// Error
return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
return NextResponse.json({ error: "Lỗi server" }, { status: 500 })

// Success với message
return NextResponse.json({ success: true, message: "Thành công" })
```

### GET Route

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const categoryId = searchParams.get("category")

    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId: Number(categoryId) } : undefined,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: products })
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
```

### POST Route với Zod

```typescript
// app/api/products/route.ts
import { productSchema } from "@/schemas/product"

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = productSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: { ...parsed.data, sellerId: user.id },
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    console.error("Failed to create product:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
```

### Dynamic Route

```typescript
// app/api/products/[id]/route.ts
interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  })

  if (!product) {
    return NextResponse.json(
      { error: "Không tìm thấy sản phẩm" },
      { status: 404 }
    )
  }

  return NextResponse.json({ data: product })
}
```

---

## Authentication

### Server-side — Lấy session

```typescript
import { getSession } from "@/lib/auth"

export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
  }

  // user.id, user.role, user.email...
}
```

### Client-side — Dùng auth store

```typescript
'use client'

import { useAuth } from '@/stores/auth-store'

export const ProfilePage = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Spinner />
  if (!user) return <redirect to="/login" />

  return <div>Xin chào, {user.name}</div>
}
```

### Form với React Hook Form + Zod

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/schemas/auth'
import { useAuth } from '@/stores/auth-store'

export const LoginForm = () => {
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    const result = await login(data.email, data.password)
    if (result.error) {
      setError('root', { message: result.error })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} type="email" placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" placeholder="Mật khẩu" />
      {errors.password && <span>{errors.password.message}</span>}

      {errors.root && <span>{errors.root.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  )
}
```
