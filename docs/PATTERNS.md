# Common Patterns & Examples

Các patterns và examples thường dùng trong dự án.

## 📋 Mục lục

- [Component Patterns](#component-patterns)
- [Data Fetching](#data-fetching)
- [Form Handling](#form-handling)
- [Error Handling](#error-handling)
- [State Management](#state-management)
- [API Routes](#api-routes)

---

## Component Patterns

### Basic Component

```typescript
// components/product/product-card.tsx
import { Card } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const handleClick = () => {
    onAddToCart?.(product)
  }

  return (
    <Card>
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price)}</p>
      <button onClick={handleClick}>Add to Cart</button>
    </Card>
  )
}
```

### Component with Children

```typescript
// components/common/container.tsx
interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export const Container = ({ children, className }: ContainerProps) => {
  return <div className={cn("container mx-auto px-4", className)}>{children}</div>
}
```

### Compound Component Pattern

```typescript
// components/ui/card.tsx
interface CardProps {
  children: React.ReactNode
}

export const Card = ({ children }: CardProps) => {
  return <div className="card">{children}</div>
}

Card.Header = ({ children }: CardProps) => {
  return <div className="card-header">{children}</div>
}

Card.Body = ({ children }: CardProps) => {
  return <div className="card-body">{children}</div>
}

Card.Footer = ({ children }: CardProps) => {
  return <div className="card-footer">{children}</div>
}

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### Render Props Pattern

```typescript
interface DataFetcherProps<T> {
  url: string
  children: (data: T | null, isLoading: boolean, error: Error | null) => React.ReactNode
}

export const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [url])

  return <>{children(data, isLoading, error)}</>
}

// Usage
<DataFetcher<User[]> url="/api/users">
  {(users, isLoading, error) => {
    if (isLoading) return <Spinner />
    if (error) return <Error error={error} />
    return <UserList users={users} />
  }}
</DataFetcher>
```

---

## Data Fetching

### Server Component (Next.js 15+)

```typescript
// app/products/page.tsx
import { prisma } from "@/lib/prisma"
import { ProductList } from "@/components/product/product-list"

const getProducts = async () => {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  })
  return products
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  )
}
```

### Client Component with SWR

```typescript
// components/product/product-list.tsx
"use client"

import useSWR from "swr"
import { ProductCard } from "./product-card"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export const ProductList = () => {
  const { data, error, isLoading } = useSWR<Product[]>("/api/products", fetcher)

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  if (!data) return null

  return (
    <div className="grid grid-cols-3 gap-4">
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Parallel Data Fetching

```typescript
// app/dashboard/page.tsx
const getStats = async () => {
  const [users, orders, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
  ])

  return { users, orders, revenue: revenue._sum.total ?? 0 }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return <DashboardStats stats={stats} />
}
```

### Incremental Static Regeneration (ISR)

```typescript
// app/products/[slug]/page.tsx
export const revalidate = 3600 // Revalidate every hour

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  })

  if (!product) notFound()

  return <ProductDetail product={product} />
}
```

---

## Form Handling

### React Hook Form + Zod

```typescript
// components/auth/login-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Login failed")

      // Redirect or update state
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input {...register("email")} type="email" placeholder="Email" />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <div>
        <Input {...register("password")} type="password" placeholder="Password" />
        {errors.password && <span className="error">{errors.password.message}</span>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  )
}
```

### Form with Server Actions

```typescript
// app/products/new/page.tsx
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const createProduct = async (formData: FormData) => {
  const name = formData.get("name") as string
  const price = parseFloat(formData.get("price") as string)

  const product = await prisma.product.create({
    data: { name, price },
  })

  revalidatePath("/products")
  redirect(`/products/${product.slug}`)
}

// Client component
export default function NewProductPage() {
  return (
    <form action={createProduct}>
      <input name="name" required />
      <input name="price" type="number" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

---

## Error Handling

### Try-Catch Pattern

```typescript
const fetchUser = async (id: number) => {
  try {
    const response = await fetch(`/api/users/${id}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const user = await response.json()
    return user
  } catch (error) {
    console.error("Failed to fetch user:", error)
    throw error // Re-throw để component xử lý
  }
}
```

### Error Boundary

```typescript
// components/error-boundary.tsx
"use client"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Something went wrong</div>
    }

    return this.props.children
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <ProductList />
</ErrorBoundary>
```

### API Error Response

```typescript
// app/api/products/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const products = await prisma.product.findMany()
    return NextResponse.json(products)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
```

---

## State Management

### Zustand Store

```typescript
// lib/store/cart-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      clearCart: () => set({ items: [] }),

      total: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    }
  )
)

// Usage in component
const { items, addItem, total } = useCartStore()
```

### Context Pattern

```typescript
// lib/context/auth-context.tsx
"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    setUser(data.user)
  }

  const logout = () => {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

// Usage
<AuthProvider>
  <App />
</AuthProvider>
```

---

## API Routes

### GET Request

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get("category")

  const products = await prisma.product.findMany({
    where: category ? { categoryId: parseInt(category) } : undefined,
    include: { images: true },
  })

  return NextResponse.json(products)
}
```

### POST Request

```typescript
// app/api/products/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        price: body.price,
        description: body.description,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Failed to create product:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
```

### Dynamic Route

```typescript
// app/api/products/[id]/route.ts
interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
  })

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const body = await request.json()

  const product = await prisma.product.update({
    where: { id: parseInt(params.id) },
    data: body,
  })

  return NextResponse.json(product)
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  await prisma.product.delete({
    where: { id: parseInt(params.id) },
  })

  return NextResponse.json({ success: true })
}
```

### Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const middleware = (request: NextRequest) => {
  const token = request.cookies.get("token")

  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
```

---

## Custom Hooks

### useDebounce

```typescript
// hooks/use-debounce.ts
import { useEffect, useState } from "react"

export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Usage
const [searchTerm, setSearchTerm] = useState("")
const debouncedSearch = useDebounce(searchTerm, 500)

useEffect(() => {
  if (debouncedSearch) {
    fetchResults(debouncedSearch)
  }
}, [debouncedSearch])
```

### useLocalStorage

```typescript
// hooks/use-local-storage.ts
import { useState, useEffect } from "react"

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}

// Usage
const [theme, setTheme] = useLocalStorage("theme", "light")
```

### useMediaQuery

```typescript
// hooks/use-media-query.ts
import { useState, useEffect } from "react"

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)

    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}

// Usage
const isMobile = useMediaQuery("(max-width: 768px)")
```

---

## Testing Patterns

### Component Test

```typescript
// __tests__/product-card.test.tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { ProductCard } from "@/components/product/product-card"

describe("ProductCard", () => {
  const mockProduct = {
    id: 1,
    name: "Test Product",
    price: 100000,
    image: "/test.jpg",
  }

  it("renders product information", () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText("Test Product")).toBeInTheDocument()
    expect(screen.getByText("100.000 ₫")).toBeInTheDocument()
  })

  it("calls onAddToCart when button clicked", () => {
    const handleAddToCart = jest.fn()
    render(<ProductCard product={mockProduct} onAddToCart={handleAddToCart} />)

    fireEvent.click(screen.getByText("Add to Cart"))
    expect(handleAddToCart).toHaveBeenCalledWith(mockProduct)
  })
})
```

### API Test

```typescript
// __tests__/api/products.test.ts
import { GET, POST } from "@/app/api/products/route"
import { prisma } from "@/lib/prisma"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

describe("/api/products", () => {
  it("GET returns products", async () => {
    const mockProducts = [{ id: 1, name: "Product 1" }]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)

    const response = await GET(new Request("http://localhost/api/products"))
    const data = await response.json()

    expect(data).toEqual(mockProducts)
  })
})
```

---

Tham khảo thêm:

- [CONVENTIONS.md](./CONVENTIONS.md) - Quy ước code tổng quát
- [CODE_STANDARDS.md](./CODE_STANDARDS.md) - Chuẩn code hiện đại
