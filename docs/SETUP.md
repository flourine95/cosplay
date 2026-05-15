# Hướng dẫn Setup

## Yêu cầu

- Node.js >= 18
- Docker Desktop
- Supabase CLI

## Cài đặt Supabase CLI

Xem hướng dẫn chi tiết tại: https://supabase.com/docs/guides/cli/getting-started

## Các bước setup

### 1. Clone và install

```bash
git clone <repo-url>
cd cosplay
npm ci
```

### 2. Setup environment

```bash
cp .env.example .env
```

### 3. Start Supabase

```bash
npm run db:start
```

Output sẽ hiển thị các keys. Copy và paste vào file `.env`:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

### 4. Chạy migrations

```bash
npm run db:migrate
```

### 5. Seed dữ liệu mẫu

```bash
npm run db:seed
```

Lệnh này tạo:

- 3 tài khoản demo (admin, seller, customer)
- 5 categories
- 5 products mẫu
- System settings

### 6. Start dev server

```bash
npm run dev
```

Mở http://localhost:3000

## Tài khoản demo

| Role     | Email               | Password        |
| -------- | ------------------- | --------------- |
| Admin    | admin@cosplay.vn    | Admin@123456    |
| Seller   | seller@cosplay.vn   | Seller@123456   |
| Customer | customer@cosplay.vn | Customer@123456 |

## Scripts thường dùng

```bash
# Development
npm run dev              # Start dev server
npm run db:studio        # Mở Prisma Studio (xem database)

# Database
npm run db:start         # Start Supabase
npm run db:stop          # Stop Supabase
npm run db:migrate       # Chạy migrations
npm run db:seed          # Seed data
npm run db:fresh         # Reset + Migrate + Seed (làm mới DB)

# Code quality
npm run lint             # Check linting
npm run format           # Format code
npm run typecheck        # Check TypeScript
```

## Troubleshooting

### Lỗi: "Cannot connect to database"

```bash
# Kiểm tra Supabase có chạy không
npm run db:status

# Nếu không chạy
npm run db:start
```

### Lỗi: "Port already in use"

```bash
# Dừng Supabase và start lại
npm run db:stop
npm run db:start
```

### Muốn reset database

```bash
npm run db:fresh
```

### Prisma Client lỗi

```bash
npm run db:generate
```
