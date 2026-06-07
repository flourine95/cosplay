# Cosplay Marketplace

Nền tảng thương mại điện tử chuyên về trang phục cosplay.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Database:** PostgreSQL (Supabase Local)
- **ORM:** Prisma 7
- **Auth & Storage:** Supabase
- **State Management:** Zustand, React Query
- **Forms:** React Hook Form, Zod

## Cài đặt

### Yêu cầu

- Node.js >= 18
- Docker Desktop
- Supabase CLI: `npm install -g supabase` ([docs](https://supabase.com/docs/guides/local-development))

### Setup

```bash
# 1. Clone repo
git clone https://github.com/flourine95/cosplay
cd cosplay

# 2. Install dependencies
npm ci

# 3. Copy .env
cp .env.example .env

# 4. Start Supabase local
npm run db:start

# 5. Chạy Prisma migrations (tạo bảng)
npm run db:migrate

# 6. Seed dữ liệu mẫu
npm run db:seed

# 7. Start dev server
npm run dev
```

Mở http://localhost:3000

## Tài khoản demo

| Role     | Email               | Password        |
| -------- | ------------------- | --------------- |
| Admin    | admin@cosplay.vn    | Admin@123456    |
| Seller   | seller@cosplay.vn   | Seller@123456   |
| Customer | customer@cosplay.vn | Customer@123456 |

## Documentation

- [Setup Guide](docs/SETUP.md) - Hướng dẫn cài đặt chi tiết
- [Code Conventions](docs/CONVENTIONS.md) - Quy ước code và naming
- [Common Patterns](docs/PATTERNS.md) - Patterns và examples thường dùng
- [Code Standards](docs/CODE_STANDARDS.md) - Chuẩn code hiện đại
- [Business Flows](docs/BUSINESS_FLOWS.md) - Luồng nghiệp vụ
- [Database Guide](docs/DATABASE_GUIDE.md) - Hướng dẫn database
