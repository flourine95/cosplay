# Cosplay Platform

E-commerce platform chuyên về trang phục và phụ kiện cosplay, hỗ trợ bán lẻ, cho thuê và đặt may theo yêu cầu.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: PostgreSQL (Supabase Local)
- **ORM**: Prisma 7.8
- **Realtime**: Supabase Realtime
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **State**: Zustand, React Query

## Prerequisites

- Node.js 18+
- Docker Desktop (cho Supabase Local)
- Git

## Quick Start

### 1. Clone và cài đặt dependencies

```bash
git clone https://github.com/flourine95/cosplay
cd cosplay
npm ci
```

### 2. Setup database

```bash
cp .env.example .env
npm run db:start
npx prisma migrate dev --name init
```

Lần đầu `db:start` mất 5-10 phút để pull Docker images.

### 3. Chạy development server

```bash
npm run dev
```

Mở http://localhost:3000

### 4. Verify setup

- Database: http://localhost:3000/api/test-db
- Supabase Studio: http://127.0.0.1:54323

## Available Scripts

### Development

```bash
npm run dev          # Start dev server với Turbopack
npm run build        # Build production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code với Prettier
npm run typecheck    # Check TypeScript types
```

### Database

```bash
npm run db:start     # Khởi động Supabase Local
npm run db:stop      # Dừng Supabase
npm run db:status    # Xem status và connection strings
npm run db:reset     # Reset database (xóa data)
npm run db:migrate   # Tạo migration mới
npm run db:push      # Push schema nhanh (no migration)
npm run db:generate  # Generate Prisma Client
npm run db:studio    # Mở Prisma Studio GUI
```

## Project Structure

```
cosplay/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (routes)/          # Page routes
│   └── layout.tsx         # Root layout
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client
│   └── supabase/         # Supabase clients
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
├── docs/                  # Documentation
└── supabase/             # Supabase config
```

## Documentation

- [Business Flows & Schema Logic](docs/BUSINESS_FLOWS.md)
- [Database Guide](docs/DATABASE_GUIDE.md)
- [Product & Design Principles](docs/PRODUCT.md)

## Environment Variables

Copy file mẫu:

```bash
cp .env.example .env
```

Các key Supabase được tự động sinh sau `npm run db:start`.

## Database Workflow

### Thêm/sửa schema

1. Sửa `prisma/schema.prisma`
2. Tạo migration:
   ```bash
   npx prisma migrate dev --name ten_migration
   ```
3. Restart dev server

### Reset database

```bash
npm run db:reset
```

Xóa toàn bộ data và apply lại tất cả migrations.

### Xem database

- Prisma Studio: `npm run db:studio`
- Supabase Studio: http://127.0.0.1:54323

Chi tiết: [Database Guide](docs/DATABASE_GUIDE.md)

## Troubleshooting

### Docker không chạy

```bash
docker --version
# Nếu lỗi: Mở Docker Desktop và đợi khởi động xong
```

### Supabase không start

```bash
npm run db:stop
npm run db:start
```

### Prisma types lỗi

```bash
npx prisma generate
# Restart dev server
```

### Port bị chiếm

Supabase sử dụng các ports:

- 54321: API
- 54322: PostgreSQL
- 54323: Studio

Đổi port trong `supabase/config.toml` nếu conflict.

## Git Workflow

### Commit conventions

```bash
feat: thêm tính năng mới
fix: sửa bug
chore: cập nhật config, dependencies
docs: cập nhật documentation
refactor: refactor code
```

### Pre-commit hooks

Husky tự động chạy:

- ESLint (fix errors)
- Prettier (format code)

Nếu có lỗi, commit sẽ bị reject. Fix lỗi rồi commit lại.

## Contributing

1. Tạo branch mới từ `main`
2. Commit changes
3. Push và tạo Pull Request
4. Đợi review

## License

Private project
