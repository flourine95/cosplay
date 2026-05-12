# Database Guide

- **Database**: PostgreSQL 17
- **ORM**: Prisma 7.8
- **Local Development**: Supabase Local (Docker)
- **Schema**: `prisma/schema.prisma`

---

## Setup lần đầu

```bash
# 1. Khởi động Supabase Local (Docker) — lần đầu mất 5-10 phút pull images
npm run db:start

# 2. Tạo migration đầu tiên và apply vào DB
#    (tạo toàn bộ tables + enable Supabase Realtime cho chat)
npx prisma migrate dev --name init

# 3. Generate Prisma Client
npx prisma generate
```

> **Realtime cho chat:** Sau khi migrate xong, vào [Supabase Studio → Database → Publications](http://127.0.0.1:54323/project/default/database/publications), chọn `supabase_realtime` → enable bảng `Message` và `Conversation`. Bước này chỉ cần làm một lần. Nếu bỏ qua, chat vẫn hoạt động nhưng không real-time.

---

## Commands hàng ngày

```bash
npm run db:start       # Khởi động DB
npm run db:stop        # Dừng DB
npm run db:status      # Xem connection strings
npm run db:studio      # Mở Prisma Studio (http://localhost:5555)
```

```bash
npx prisma migrate dev --name ten_migration   # Tạo migration mới
npx prisma migrate reset --force              # Reset DB (xóa toàn bộ data)
npx prisma generate                           # Generate Prisma Client
npx prisma db push                            # Push schema nhanh (không tạo migration file)
```

---

## Workflow sửa schema

```bash
# 1. Sửa prisma/schema.prisma
# 2. Tạo migration
npx prisma migrate dev --name mo_ta_thay_doi
# 3. Restart dev server
```

Prisma tự động generate lại Client sau migrate.

### Đổi kiểu dữ liệu (cần can thiệp thủ công)

```bash
# Tạo migration file nhưng chưa apply
npx prisma migrate dev --create-only --name change_column_type

# Sửa SQL trong prisma/migrations/[timestamp]_change_column_type/migration.sql nếu cần

# Apply
npx prisma migrate dev
```

---

## Deploy lên Supabase Cloud

### Lần đầu

1. Tạo project tại [supabase.com](https://supabase.com)
2. Vào **Project Settings → Database** lấy connection strings
3. Cập nhật `.env`:

```env
# Dùng pooler (port 6543) cho app
DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:6543/postgres?pgbouncer=true"

# Dùng direct (port 5432) cho migration
DIRECT_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
```

4. Apply schema và Realtime config:

```bash
npx prisma migrate deploy
supabase db push --db-url "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
```

### Các lần sau

```bash
# Local: tạo migration
npx prisma migrate dev --name ten_thay_doi

# Production: apply
npx prisma migrate deploy
```

Prisma tự track qua bảng `_prisma_migrations` — chỉ apply những migration chưa chạy.

---

## Best practices

- Đặt tên migration mô tả rõ: `add_user_bio`, `change_order_status_enum` — không dùng `update`
- Luôn commit `prisma/migrations/` cùng với code thay đổi
- Không sửa migration đã commit — tạo migration mới để fix
- Backup data trước khi migrate production

---

## Troubleshooting

**Prisma Client lỗi sau khi sửa schema:**

```bash
npx prisma generate
```

**Migration conflict:**

```bash
npx prisma migrate reset --force   # Reset toàn bộ (mất data)
```

**Port bị chiếm:**
Đổi trong `supabase/config.toml`:

```toml
[db]
port = 54322
```

---

## Related

- [Business Flows & Schema Logic](BUSINESS_FLOWS.md)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
