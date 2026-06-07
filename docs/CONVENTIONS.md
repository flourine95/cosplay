# Conventions

Quy ước đặt tên, cấu trúc file, git workflow cho dự án Cosplay Marketplace.

## Mục lục

- [Naming Conventions](#naming-conventions)
- [File & Folder Structure](#file--folder-structure)
- [Import Order](#import-order)
- [Git Workflow](#git-workflow)
- [Tools & Automation](#tools--automation)

---

## Naming Conventions

### Files & Folders

Dùng `kebab-case` cho tất cả:

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
```

### Variables & Functions

Dùng `camelCase`:

```typescript
✅ Good
const userId = 123
const getUserById = (id: number) => {}

❌ Bad
const user_id = 123
const GetUserById = (id: number) => {}
```

Boolean prefix với `is`, `has`, `can`, `should`:

```typescript
✅ Good
isLoading, hasPermission, canEdit, shouldRender

❌ Bad
loading, permission, edit, render
```

### Components, Types, Interfaces

Dùng `PascalCase`:

```typescript
✅ Good
UserCard, AuthService, ProductDto

❌ Bad
userCard, authService, productDto
```

### Constants

Dùng `UPPER_SNAKE_CASE` chỉ cho constant thật sự (không đổi trong suốt runtime):

```typescript
✅ Good
const MAX_RETRY_COUNT = 3
const SESSION_DURATION_DAYS = 30

❌ Bad
const maxRetryCount = 3
```

### Enums (Prisma)

Prisma dùng `UPPER_CASE` cho enum values — theo đúng schema:

```typescript
// Prisma schema
enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPING
  COMPLETED
}

// Dùng trong code
if (order.status === OrderStatus.PENDING) { ... }
```

### Stores

File stores dùng suffix `-store.ts`, export hook dùng prefix `use`:

```typescript
// stores/cart-store.ts
export const useCart = create<CartStore>()(...)

// stores/auth-store.ts
export const useAuth = create<AuthStore>()(...)
```

---

## File & Folder Structure

### Tổng quan

```
cosplay/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public routes (route group, không ảnh hưởng URL)
│   ├── (admin)/             # Admin routes
│   ├── (seller)/            # Seller routes
│   ├── api/                 # API routes
│   └── generated/           # Prisma generated client (KHÔNG EDIT)
│
├── components/              # Chỉ dành cho shared/reusable components
│   └── ui/                  # shadcn/ui components (KHÔNG EDIT thủ công)
│
├── lib/                     # Core utilities & configurations
│   ├── prisma.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── supabase/
│       ├── client.ts        # Supabase browser client
│       └── server.ts        # Supabase admin (server-side)
│
├── providers/               # React context providers
│   ├── auth-provider.tsx
│   └── query-provider.tsx
│
├── stores/                  # Zustand stores
│   ├── auth-store.ts
│   └── cart-store.ts
│
├── schemas/                 # Zod validation schemas
│   └── auth.ts
│
├── types/                   # TypeScript types (chỉ cho API contracts & UI types)
│   └── api.ts
│
├── hooks/                   # Shared custom hooks (dùng ở 2+ features)
│
└── prisma/
    ├── schema.prisma        # Source of truth cho database
    └── seed.ts
```

### Colocation Pattern

Component, hook, util **chỉ dùng ở 1 route** thì đặt cùng folder với route đó:

```
app/admin/categories/
├── category-panel.tsx      # Chỉ dùng ở đây
├── category-tree.tsx       # Chỉ dùng ở đây
├── use-categories.ts       # Chỉ dùng ở đây
└── page.tsx
```

Chỉ chuyển lên `components/` hoặc `hooks/` khi dùng ở **2+ route khác nhau**.

### Single Component Per File

```typescript
// ✅ Good: product-card.tsx — 1 component
export const ProductCard = ({ product }: ProductCardProps) => { ... }

// ❌ Bad: nhiều components trong 1 file
export const ProductCard = () => {}
export const ProductList = () => {}
export const ProductFilter = () => {}
```

---

## Import Order

```typescript
// 1. React & Next.js
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// 2. Third-party libraries
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"

// 3. Internal absolute imports (@/)
import { Button } from "@/components/ui/button"
import { useAuth } from "@/stores/auth-store"
import { prisma } from "@/lib/prisma"
import type { User } from "@/app/generated/prisma/client"

// 4. Relative imports
import { ProductCard } from "./product-card"
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

Format: `type: mô tả ngắn gọn`

```
✅ Good
feat: add user authentication
fix: resolve cart total calculation
refactor: extract payment logic to service
docs: update API documentation
chore: upgrade dependencies

❌ Bad
update code
fix bug
wip
changes
```

Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

### Pull Request

Title ngắn gọn dưới 70 ký tự. Description gồm:

```markdown
## Changes

- Mô tả thay đổi

## Testing

- Đã test gì

## Screenshots (nếu có UI changes)
```

---

## Tools & Automation

### Scripts

```bash
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier format
npm run format:check  # Prettier check
npm run typecheck     # TypeScript check
```

### Pre-commit Hook (Husky + lint-staged)

Tự động chạy khi commit:

- ESLint fix + Prettier cho `*.ts`, `*.tsx`
- Prettier cho `*.json`, `*.css`, `*.md`

### Checklist trước khi commit

- [ ] Không có ESLint errors
- [ ] Không có TypeScript errors
- [ ] Đã remove `console.log`
- [ ] Commit message rõ ràng
