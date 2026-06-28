# Kế hoạch refactor module seller

Tài liệu này ghi lại pattern refactor cho module seller, bắt đầu từ `seller/products`. Mục tiêu là giảm component tách theo cảm tính, gom logic dùng chung, và tạo mẫu có thể áp dụng cho `orders`, `quotes`, `tailoring`, `revenue`, `calendar`, và `statistics`.

## Mục tiêu

Refactor module seller theo hướng page mỏng, component có trách nhiệm rõ, và util dùng chung đặt ở nơi ổn định. Code mới phải bám vào Next.js App Router, React 19, shadcn/ui `radix-nova`, Tailwind CSS 4, React Hook Form, Zod, Prisma, Supabase, và sonner.

## Pattern thư mục

Giữ code seller trong `components/seller`. Không tạo `features/` ở giai đoạn này.

```txt
components/
  seller/
    seller-shell.tsx
    seller-page-header.tsx
    seller-ui.tsx

    products/
      product-list-client.tsx
      product-stats.tsx
      product-table.tsx
      product-delete-dialog.tsx
      product-form.tsx
      product-form-utils.ts
      product-form-fields.tsx
      product-image-field.tsx
      product-variant-fields.tsx
      product-types.ts
      product-constants.ts
```

Shared helper đặt ở `lib`:

```txt
lib/
  format.ts
  slug.ts
```

## Quy tắc tách component

Chỉ tách component khi component mới có một trách nhiệm rõ:

- **Tái sử dụng thật**: ví dụ `SellerPageHeader`, `ProductStatusBadge`, `SellerStatCard`
- **Có state hoặc interaction riêng**: ví dụ `ProductDeleteDialog`, `ProductImageField`, `ProductVariantFields`
- **Giảm độ dài file có ích**: ví dụ tách table, stats, dialog khỏi list client
- **Thu nhỏ client boundary**: chỉ file có state, effect, event handler, hoặc browser API mới dùng `"use client"`

Không tách component chỉ để đổi tên một block JSX. Tránh tên mơ hồ như `ProductsContent`, `ProductsSection`, `ProductsWrapper`, hoặc tên có hậu tố `New`.

## Quy ước tên

Dùng tên theo domain và trách nhiệm:

```txt
ProductsSectionNew  -> ProductListClient
ProductForm         -> SellerProductForm
StatCard            -> SellerStatCard nếu dùng lại nhiều seller page
SellerShellNew      -> SellerShell
DashboardSectionNew -> SellerDashboard
OrdersSectionNew    -> SellerOrderList
QuotesSectionNew    -> SellerQuoteList
```

Không dùng hậu tố `New`. Nếu cần migration từng bước, export alias tạm thời trong một commit riêng rồi xóa sau khi đổi import.

## Page pattern

Page trong `app/seller/products` chỉ nên render layout cấp route và gọi component domain.

```tsx
import { SellerPageHeader } from "@/components/seller/seller-page-header"
import { ProductListClient } from "@/components/seller/products/product-list-client"

export default function SellerProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <SellerPageHeader
        title="Quản lý sản phẩm"
        description="Quản lý tồn kho, mô hình bán/thuê và trạng thái hiển thị"
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Seller Center", href: "/seller" },
          { label: "Quản lý sản phẩm" },
        ]}
      />

      <ProductListClient />
    </div>
  )
}
```

## Product list pattern

`ProductListClient` giữ orchestration của màn danh sách:

- Fetch `/api/seller/products`
- Giữ state filter, sort, delete target, loading, deleting
- Tính filtered và sorted data
- Render `ProductStats`, `ProductTable`, và `ProductDeleteDialog`

Các phần render chi tiết nằm trong component con:

- `ProductStats`: nhận stats và render card thống kê
- `ProductTable`: nhận products, sort state, callbacks, và render table
- `ProductDeleteDialog`: nhận product, open state, deleting state, và callback confirm

## Product form pattern

`SellerProductForm` giữ orchestration của form:

- Khởi tạo `useForm`
- Fetch categories và product khi edit
- Submit create hoặc update
- Điều phối các field component

Logic không render UI chuyển ra file riêng:

- `product-form-utils.ts`: `defaultProductFormValues`, `toProductFormValues`, `normalizeProductPayload`
- `lib/slug.ts`: `slugify`
- `lib/format.ts`: `formatCurrency`

Các cụm field tách theo interaction:

- `ProductBasicFields`: tên, slug, SKU, danh mục, tình trạng, mô tả
- `ProductImageField`: upload, preview, remove image
- `ProductVariantFields`: field array cho size và tồn kho
- `ProductPricingFields`: giá bán và giá so sánh
- `ProductRentalFields`: giá thuê, cọc, ngày thuê, tình trạng đồ thuê
- `ProductVisibilityFields`: loại sản phẩm và trạng thái

## Shared format và util

Không định nghĩa lại formatter trong từng component. Dùng `lib/format.ts` cho format hiển thị chung.

```ts
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}
```

Dùng `lib/slug.ts` cho slug logic:

```ts
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
```

Giữ domain constants trong module products:

- `product-constants.ts`: status label, business type label, route constants
- `product-types.ts`: API response type và UI-only type cho seller product
- `product-form-utils.ts`: mapper và normalizer riêng cho form sản phẩm

## shadcn/ui rules khi refactor

Áp dụng các rule này khi sửa component seller:

- Dùng `gap-*`, không dùng `space-y-*`
- Dùng `size-*` khi width và height bằng nhau
- Dùng `Field`, `FieldGroup`, `FieldLabel`, `FieldError` cho form
- Dùng `Skeleton`, `Spinner`, `Empty`, `Badge`, `Separator` thay vì markup tự chế
- Icon trong `Button` dùng `data-icon`, không tự set size class
- Dùng semantic token như `bg-background`, `text-muted-foreground`, `border-border`
- Hạn chế raw color như `text-slate-*`, `bg-emerald-*` trong component app
- Dialog, Sheet, Drawer phải có title cho accessibility

## Thứ tự refactor

Làm theo thứ tự này để giảm rủi ro:

1. Tạo `lib/format.ts` và `lib/slug.ts`
2. Tạo `components/seller/products`
3. Đổi `ProductsSectionNew` thành `ProductListClient`
4. Tách `product-types.ts` và `product-constants.ts`
5. Tách `ProductStats`, `ProductTable`, và `ProductDeleteDialog`
6. Di chuyển `ProductForm` thành `SellerProductForm`
7. Tách `product-form-utils.ts`
8. Tách các field component trong form
9. Đổi import trong `app/seller/products/*`
10. Chạy `npm run lint` và `npm run typecheck`

## Checklist trước khi merge

- Không còn tên component có hậu tố `New` trong module đã refactor
- Không còn `formatCurrency` hoặc `slugify` định nghĩa lặp trong component
- Page trong `app/seller/products` không chứa logic filter, sort, fetch, submit, hoặc upload
- Component con có tên theo trách nhiệm, không theo vị trí layout
- Form dùng schema từ `schemas/seller-product.ts`
- Mapper API sang form nằm ngoài JSX component
- shadcn/ui component dùng đúng composition
- Client component chỉ xuất hiện khi cần state, effect, event handler, hoặc browser API
- `npm run lint` pass
- `npm run typecheck` pass
