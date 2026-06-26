# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repo này.

## Dự án

Sàn thương mại điện tử cosplay (mua / bán / cho thuê / đặt may theo số đo). Multi-role: CUSTOMER, SELLER, ADMIN. Toàn bộ UI và thông báo cho người dùng viết bằng **tiếng Việt**.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript** (strict)
- **Prisma 7** với adapter `@prisma/adapter-pg` — client được generate ra `app/generated/prisma` (KHÔNG phải `@prisma/client`)
- **Supabase local** (Postgres 17) chạy qua Docker, dùng làm database. Auth thì tự build, không dùng Supabase Auth.
- **Zod** validation, **TanStack Query**, **Zustand**, **shadcn/ui** + **Tailwind v4**, **sonner** cho toast

## Setup lần đầu

Yêu cầu: Node, npm, và **Docker Desktop đang chạy** (Supabase local cần Docker).

```bash
npm install                      # postinstall tự chạy `prisma generate`
cp .env.example .env             # tạo file env
npm run db:start                 # khởi động Supabase local (Docker)
npm run db:status                # lấy ANON_KEY và SERVICE_ROLE_KEY -> dán vào .env
npm run db:migrate               # apply migrations (prisma migrate dev)
npm run db:seed                  # seed dữ liệu mẫu
npm run dev                      # chạy app tại http://localhost:3000
```

Có thể gộp 3 bước DB bằng `npm run db:fresh` (reset + migrate + seed).

## Lệnh thường dùng

| Lệnh                                | Mục đích                                           |
| ----------------------------------- | -------------------------------------------------- |
| `npm run dev`                       | Dev server (Turbopack)                             |
| `npm run build`                     | Build production                                   |
| `npm run typecheck`                 | `tsc --noEmit` — chạy sau khi sửa types            |
| `npm run lint` / `npm run lint:fix` | ESLint                                             |
| `npm run format`                    | Prettier                                           |
| `npm run db:studio`                 | Prisma Studio (xem/sửa data)                       |
| `npm run db:reset`                  | Reset DB về migration + seed                       |
| `npm run db:generate`               | Regenerate Prisma client (chạy sau khi đổi schema) |

## Quy ước code

- **Import Prisma client** từ `@/lib/prisma`, types/enums từ `@/app/generated/prisma/...` — không import từ `@prisma/client`.
- **Path alias**: `@/*` trỏ về gốc repo (xem `tsconfig.json`).
- **Prettier**: không semicolon, dùng double quotes, 2 spaces, printWidth 80. Đừng đổi style thủ công.
- **Validation**: mọi input từ client validate bằng Zod schema (xem thư mục `schemas/` và `lib/schemas/`).
- **API routes** (`app/api/**/route.ts`): trả `NextResponse.json`, bắt lỗi với try/catch, message lỗi bằng tiếng Việt, set HTTP status đúng (400 validation, 401 auth, 403 forbidden, 500 server).
- **Tiền**: dùng `Decimal(15,2)` trong schema — cẩn thận khi tính toán/serialize Decimal.

## Auth (tự build, lưu ý)

- Session-based qua cookie `session_id` (httpOnly), bcrypt cost 12. Logic ở `lib/auth.ts`.
- Lấy user hiện tại: `getSession()` (đã wrap bằng React `cache`). Trả về `null` nếu chưa đăng nhập / session hết hạn / user bị SUSPENDED hoặc INACTIVE.
- **Không bao giờ trả `password` về client** — luôn dùng `sanitizeUser()`.
- Type của user đã đăng nhập: `SessionUser`.

## Lưu ý quan trọng

- `app/generated/prisma/**` là code generate, **đừng sửa tay** và đừng review như code thường.
- Đổi `prisma/schema.prisma` thì phải chạy `npm run db:migrate` (tạo migration) + `npm run db:generate`.
- Cần Docker chạy trước khi `db:start`. Nếu lệnh DB lỗi connection, kiểm tra Docker và `npm run db:status`.
- Sau khi sửa code, chạy `npm run typecheck` và `npm run lint` trước khi coi là xong.
