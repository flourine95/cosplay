---
inclusion: always
---

# Project Structure & Conventions

Tài liệu đầy đủ nằm trong `docs/`. Các file dưới đây là nguồn chính — team không dùng Kiro cũng đọc được:

- **[docs/CONVENTIONS.md](../../docs/CONVENTIONS.md)** — Naming, file structure, colocation, git workflow
- **[docs/PATTERNS.md](../../docs/PATTERNS.md)** — TypeScript, Zod, React, React Query, Zustand, API routes
- **[docs/DATABASE_GUIDE.md](../../docs/DATABASE_GUIDE.md)** — Prisma, Supabase, migrations
- **[docs/BUSINESS_FLOWS.md](../../docs/BUSINESS_FLOWS.md)** — Business logic, order flows, payment

---

## Quick Reference

### Folder Structure

```
cosplay/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public routes
│   ├── (admin)/             # Admin routes
│   ├── (seller)/            # Seller routes
│   ├── api/                 # API routes
│   └── generated/           # Prisma generated client (KHÔNG EDIT)
│
├── components/ui/           # shadcn/ui only (KHÔNG EDIT thủ công)
├── lib/                     # prisma.ts, auth.ts, utils.ts, supabase/
├── providers/               # React context providers
├── stores/                  # Zustand stores (*-store.ts)
├── schemas/                 # Zod validation schemas
├── types/                   # API contracts & UI-only types
├── hooks/                   # Shared hooks (dùng ở 2+ features)
└── prisma/                  # schema.prisma, seed.ts
```

### Colocation Rule

Component/hook chỉ dùng ở 1 route → đặt cùng folder với route đó.
Dùng ở 2+ route → chuyển lên `components/` hoặc `hooks/`.

```
app/admin/categories/
├── category-panel.tsx   # chỉ dùng ở đây
├── use-categories.ts    # chỉ dùng ở đây
└── page.tsx
```

### Type System

```typescript
// Luôn dùng Prisma generated types
import type { User, Product } from '@/app/generated/prisma/client'
import { Prisma } from '@/app/generated/prisma/client'

// Type với relations
const withOrders = { include: { orders: true } } satisfies Prisma.UserDefaultArgs
type UserWithOrders = Prisma.UserGetPayload<typeof withOrders>
```

### Zod v4

```typescript
// ✅ Zod v4
z.email({ error: 'Email không hợp lệ' })
z.url({ error: 'URL không hợp lệ' })

// ❌ Zod v3 (không dùng)
z.string().email({ message: '...' })
```

### API Response

```typescript
import { NextResponse } from 'next/server'

return NextResponse.json({ data: result })
return NextResponse.json({ error: 'Lỗi' }, { status: 400 })
```

### Auth

```typescript
// Server-side
import { getSession } from '@/lib/auth'
const user = await getSession()

// Client-side
import { useAuth } from '@/stores/auth-store'
const { user, login, logout } = useAuth()
```

### Database

```typescript
import { prisma } from '@/lib/prisma'

// Luôn dùng singleton này, không tạo PrismaClient mới
const users = await prisma.user.findMany()
```

### Next.js Version & Breaking Conventions

Project dùng **Next.js 16**. Các thay đổi breaking so với Next.js 15:

- `middleware.ts` → **`proxy.ts`** (KHÔNG dùng `middleware.ts`)
- Export `middleware` → **`proxy`**
- `NextMiddleware` → `NextProxy`, `MiddlewareConfig` → `ProxyConfig`
- Edge runtime **KHÔNG** được hỗ trợ trong `proxy.ts`

```typescript
// ✅ Next.js 16
// file: proxy.ts
export function proxy(request: NextRequest) { ... }

// ❌ Next.js 15 và cũ hơn (KHÔNG dùng)
// file: middleware.ts
export function middleware(request: NextRequest) { ... }
```

#[[file:../../docs/CONVENTIONS.md]]
#[[file:../../docs/PATTERNS.md]]
#[[file:../../docs/DATABASE_GUIDE.md]]
#[[file:../../docs/BUSINESS_FLOWS.md]]
