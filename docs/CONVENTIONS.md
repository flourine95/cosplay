# Code Conventions & Patterns

Tài liệu quy ước code cho dự án Cosplay Marketplace.

## 📋 Mục lục

- [Naming Conventions](#naming-conventions)
- [File Structure](#file-structure)
- [TypeScript Patterns](#typescript-patterns)
- [React Patterns](#react-patterns)
- [Code Style](#code-style)
- [Git Workflow](#git-workflow)

---

## Naming Conventions

### Files & Folders

**Quy tắc**: `kebab-case`

```
✅ Good
user-profile.tsx
auth-service.ts
product-catalog/
custom-order/

❌ Bad
UserProfile.tsx
authService.ts
ProductCatalog/
customOrder/
```

### Variables & Functions

**Quy tắc**: `camelCase`

```typescript
✅ Good
const userId = 123
const getUserById = (id: number) => {}
const isLoading = false
const hasPermission = true

❌ Bad
const user_id = 123
const GetUserById = (id: number) => {}
const loading = false  // không rõ ý nghĩa
```

**Boolean naming**: Bắt đầu với `is`, `has`, `can`, `should`

```typescript
✅ Good
isActive, hasAccess, canEdit, shouldRender

❌ Bad
active, access, edit, render
```

### Components, Classes, Types, Interfaces

**Quy tắc**: `PascalCase`

```typescript
✅ Good
UserCard
AuthService
ProductDto
UserProfile

❌ Bad
userCard
authService
productDto
user_profile
```

### Constants

**Quy tắc**: `UPPER_SNAKE_CASE` (chỉ cho constant thật sự)

```typescript
✅ Good
const MAX_RETRY_COUNT = 3
const API_BASE_URL = "https://api.example.com"
const DEFAULT_PAGE_SIZE = 20

❌ Bad
const maxRetryCount = 3  // nếu là constant
const apiBaseUrl = "..."  // nếu là constant
```

### Enums

**Quy tắc**: PascalCase cho tên, PascalCase cho values

```typescript
✅ Good
enum OrderStatus {
  Pending = "PENDING",
  Confirmed = "CONFIRMED",
  Shipped = "SHIPPED",
}

❌ Bad
enum orderStatus {
  pending = "pending",
  confirmed = "confirmed",
}
```

---

## File Structure

### Project Structure

```
app/                    # Next.js App Router
├── (auth)/            # Route groups
├── api/               # API routes
├── [dynamic]/         # Dynamic routes
└── layout.tsx         # Layouts

components/            # React components
├── ui/               # shadcn/ui components (auto-generated, không edit)
├── common/           # Shared components
├── product/          # Feature-specific components
└── seller/

lib/                  # Utilities & helpers
├── utils.ts          # General utilities
├── auth.ts           # Auth helpers
└── prisma.ts         # Database client

hooks/                # Custom React hooks
├── use-cart.ts
└── use-auth.ts

prisma/               # Database
├── schema.prisma
└── seed.ts

docs/                 # Documentation
```

### Component File Structure

**Single component per file**

```typescript
// ✅ Good: product-card.tsx
import { ... }

interface ProductCardProps {
  product: Product
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return <div>...</div>
}

// ❌ Bad: Nhiều components trong 1 file
export const ProductCard = () => {}
export const ProductList = () => {}
export const ProductFilter = () => {}
```

### Import Order

```typescript
// 1. External libraries
import { useState } from "react"
import { useRouter } from "next/navigation"

// 2. Internal absolute imports
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

// 3. Relative imports
import { ProductCard } from "./product-card"
import type { Product } from "./types"

// 4. Styles (nếu có)
import "./styles.css"
```

---

## TypeScript Patterns

### Type vs Interface

**Interface**: Cho object shapes, có thể extend

```typescript
✅ Good
interface User {
  id: number
  name: string
  email: string
}

interface Admin extends User {
  permissions: string[]
}
```

**Type**: Cho unions, intersections, primitives

```typescript
✅ Good
type Status = "pending" | "active" | "inactive"
type ID = string | number
type UserWithRole = User & { role: Role }
```

### Avoid `any`

```typescript
❌ Bad
const data: any = fetchData()
const handleClick = (e: any) => {}

✅ Good
const data: User[] = fetchData()
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}

// Nếu thật sự không biết type
const data: unknown = fetchData()
if (isUser(data)) {
  // Type guard
  console.log(data.name)
}
```

### Null/Undefined Handling

```typescript
❌ Bad
const user = users[0]  // Có thể undefined
console.log(user.name)  // Runtime error

✅ Good
const user = users[0]
if (user) {
  console.log(user.name)
}

// Hoặc dùng optional chaining
console.log(users[0]?.name)

// Hoặc nullish coalescing
const name = users[0]?.name ?? "Guest"
```

### Function Types

```typescript
✅ Good - Arrow functions
const getUserById = (id: number): User | null => {
  return users.find((u) => u.id === id) ?? null
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0)
}

❌ Bad - Function declarations (trừ khi cần hoisting)
function getUserById(id: number): User | null {
  return users.find((u) => u.id === id) ?? null
}
```

---

## React Patterns

### Component Definition

```typescript
✅ Good - Arrow function với typed props
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary"
}

export const Button = ({ label, onClick, variant = "primary" }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>
}

❌ Bad - Function declaration
export function Button(props: ButtonProps) {
  return <button>{props.label}</button>
}
```

### Props Destructuring

```typescript
✅ Good
export const UserCard = ({ name, email, avatar }: UserCardProps) => {
  return <div>...</div>
}

❌ Bad
export const UserCard = (props: UserCardProps) => {
  return <div>{props.name}</div>
}
```

### State Management

```typescript
✅ Good - Descriptive names
const [isLoading, setIsLoading] = useState(false)
const [products, setProducts] = useState<Product[]>([])
const [selectedId, setSelectedId] = useState<number | null>(null)

❌ Bad
const [loading, setLoading] = useState(false)
const [data, setData] = useState([])
const [id, setId] = useState(null)
```

### Event Handlers

```typescript
✅ Good - Prefix với "handle"
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  // ...
}

const handleClick = () => {
  // ...
}

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
{products.length > 0 ? <ProductList /> : <EmptyState />}

❌ Bad
{isLoading ? <Spinner /> : null}
{error ? <ErrorMessage error={error} /> : <></>}
```

### Custom Hooks

```typescript
✅ Good - Prefix với "use"
// hooks/use-cart.ts
export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (item: CartItem) => {
    setItems((prev) => [...prev, item])
  }

  return { items, addItem }
}

❌ Bad
export const cart = () => {}  // Không có prefix "use"
export const getCart = () => {}  // Không phải hook pattern
```

---

## Code Style

### Modern JavaScript (ES2022+)

**Không dùng `var`**

```typescript
❌ Bad
var count = 0

✅ Good
const count = 0
let counter = 0
```

**Dùng arrow functions**

```typescript
❌ Bad
function double(x) {
  return x * 2
}

✅ Good
const double = (x: number) => x * 2
```

**Dùng template literals**

```typescript
❌ Bad
const message = "Hello " + name + "!"
const url = "/api/users/" + userId

✅ Good
const message = `Hello ${name}!`
const url = `/api/users/${userId}`
```

**Dùng destructuring**

```typescript
❌ Bad
const name = user.name
const email = user.email
const first = items[0]

✅ Good
const { name, email } = user
const [first, ...rest] = items
```

**Dùng spread operator**

```typescript
❌ Bad
const newUser = Object.assign({}, user, { age: 25 })
const newItems = items.concat([newItem])

✅ Good
const newUser = { ...user, age: 25 }
const newItems = [...items, newItem]
```

**Dùng optional chaining & nullish coalescing**

```typescript
❌ Bad
const name = user && user.profile && user.profile.name
const count = value !== null && value !== undefined ? value : 0

✅ Good
const name = user?.profile?.name
const count = value ?? 0
```

### Console Statements

```typescript
❌ Bad - console.log trong production code
console.log("User data:", user)
console.log("Fetching products...")

✅ Good - Chỉ dùng warn/error
console.warn("Deprecated API usage")
console.error("Failed to fetch data:", error)

✅ Good - Remove hoặc comment khi dev xong
// console.log("Debug:", data)
```

### Comments

```typescript
✅ Good - Comment "why", không comment "what"
// Retry 3 times vì API thỉnh thoảng timeout
const MAX_RETRIES = 3

// HACK: Workaround cho bug trong library v2.1
// TODO: Remove khi upgrade lên v2.2
const result = await fetchWithWorkaround()

❌ Bad - Comment rõ ràng
// Set count to 0
const count = 0

// Loop through items
items.forEach((item) => {})
```

---

## Git Workflow

### Branch Naming

```
feature/user-authentication
feature/product-catalog
fix/cart-calculation-bug
hotfix/payment-gateway-error
refactor/database-queries
docs/api-documentation
```

### Commit Messages

**Format**: `type: description`

```
✅ Good
feat: add user authentication
fix: resolve cart total calculation
refactor: extract payment logic to service
docs: update API documentation
style: format code with prettier
test: add unit tests for cart

❌ Bad
update code
fix bug
changes
wip
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `style`: Code formatting
- `test`: Tests
- `chore`: Build, dependencies

### Pull Request

**Title**: Ngắn gọn, dưới 70 ký tự

```
✅ Good
feat: implement product search with filters
fix: resolve checkout payment validation

❌ Bad
Update product page and add some features and fix bugs
```

**Description**: Mô tả chi tiết

```markdown
## Changes

- Add product search functionality
- Implement price range filter
- Add category filter

## Testing

- Tested with 1000+ products
- Verified filter combinations
- Checked mobile responsive

## Screenshots

[Attach screenshots if UI changes]
```

---

## Tools & Automation

### ESLint

Chạy trước khi commit:

```bash
npm run lint
npm run lint -- --fix  # Auto-fix
```

### Prettier

Format code:

```bash
npm run format
```

### TypeScript

Check types:

```bash
npm run typecheck
```

### Pre-commit Hook

Tự động chạy khi commit (đã setup với Husky):

```bash
# .husky/pre-commit
npm run lint
npm run typecheck
```

---

## Checklist trước khi commit

- [ ] Code đã format với Prettier
- [ ] Không có ESLint errors
- [ ] Không có TypeScript errors
- [ ] Đã test functionality
- [ ] Đã remove console.log
- [ ] Commit message rõ ràng
- [ ] Code đã review lại

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Next.js Documentation](https://nextjs.org/docs)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
