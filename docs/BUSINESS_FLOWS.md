# Luồng Nghiệp Vụ - Cosplay Platform

> Tài liệu này mô tả toàn bộ luồng vận hành của hệ thống, bao gồm schema logic, flow thanh toán, vận chuyển, và các quy tắc quan trọng cần nhớ.

---

## Mục lục

1. [Kiến trúc tổng quan](#1-kiến-trúc-tổng-quan)
2. [Quản lý địa chỉ](#2-quản-lý-địa-chỉ)
3. [Sản phẩm & Tồn kho](#3-sản-phẩm--tồn-kho)
4. [Luồng Mua Bán (Order)](#4-luồng-mua-bán-order)
5. [Luồng Đặt May (Custom Order)](#5-luồng-đặt-may-custom-order)
6. [Luồng Cho Thuê (Rental)](#6-luồng-cho-thuê-rental)
7. [Thanh toán & Escrow](#7-thanh-toán--escrow)
8. [Hoàn hàng (Return Request)](#8-hoàn-hàng-return-request)
9. [Upload Video/Ảnh](#9-upload-videoảnh)
10. [Các quy tắc quan trọng](#10-các-quy-tắc-quan-trọng)

---

## 1. Kiến trúc tổng quan

```
Customer ──→ Cart ──→ [Tách theo Seller] ──→ Order (1 per seller)
                                          ──→ Order (1 per seller)

Customer ──→ Shop Seller ──→ CustomOrder ──→ Quote ──→ Deposit ──→ Production ──→ Final Payment

Customer ──→ RentalItem ──→ RentalOrder ──→ Deposit ──→ Pickup ──→ Return ──→ Refund Deposit
```

**3 loại đơn hàng độc lập:**

- `Order` — Mua sản phẩm có sẵn
- `CustomOrder` — Đặt may theo yêu cầu
- `RentalOrder` — Thuê đồ cosplay

---

## 2. Quản lý địa chỉ

### Schema

```prisma
model User {
  savedAddresses Json @default("[]")
}
```

### Format JSON

```json
[
  {
    "id": "addr_1",
    "label": "Nhà riêng",
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 Đường ABC",
    "city": "Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé",
    "isDefault": true
  }
]
```

### Quy tắc

- User có thể lưu nhiều địa chỉ trong `savedAddresses`
- Khi đặt hàng, **snapshot** địa chỉ vào các cột `shippingName`, `shippingPhone`, `shippingAddress`, `shippingCity`, `shippingDistrict`, `shippingWard` của `Order`
- Snapshot này **không bao giờ thay đổi** dù user sửa địa chỉ sau — đây là địa chỉ giao hàng thực tế của đơn

---

## 3. Sản phẩm & Tồn kho

### Nguyên tắc Stock

**Stock chỉ quản lý tại `ProductVariant`, không còn ở `Product`.**

```
Product (không có stock)
  └── ProductVariant (stock = 10, isDefault = false) ← Size M
  └── ProductVariant (stock = 5,  isDefault = false) ← Size L
  └── ProductVariant (stock = 3,  isDefault = true)  ← Mặc định (nếu không có biến thể)
```

**Khi tạo product không có biến thể:** Bắt buộc tạo 1 `ProductVariant` với `isDefault = true`.

> **Lý do bắt buộc:** `CartItem.variantId` là `Int` (không nullable). PostgreSQL không thể enforce unique constraint trên cột nullable — `NULL != NULL` nên user có thể thêm cùng 1 sản phẩm vào giỏ 2 lần nếu `variantId = null`. Giải pháp là mọi product đều có ít nhất 1 variant.

### Rental Config

**Toàn bộ config thuê nằm ở `RentalItem`, không còn ở `Product`.**

```
Product (type = RENTAL hoặc BOTH)
  └── RentalItem
        ├── pricePerDay
        ├── depositAmount
        ├── minDays / maxDays
        └── condition
```

**Kiểm tra availability:** Không dùng `unavailableDates`. Thay vào đó query overlap:

```typescript
// Kiểm tra item có available trong khoảng thời gian không
const conflict = await prisma.rentalOrder.findFirst({
  where: {
    rentalItemId: itemId,
    status: { notIn: ["CANCELLED", "COMPLETED"] },
    OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
  },
})
const isAvailable = !conflict
```

---

## 4. Luồng Mua Bán (Order)

### Flow

```
1. Customer thêm sản phẩm vào Cart
2. Checkout → Backend tách Cart thành nhiều Order theo sellerId
3. Customer chọn địa chỉ → Snapshot vào Order
4. Customer thanh toán → Payment record tạo, escrowStatus = HOLDING
5. Seller xác nhận → status = CONFIRMED
6. Seller giao hàng → status = SHIPPING, cập nhật trackingCode
7. Customer nhận hàng → status = DELIVERED
8. Sau X ngày không khiếu nại → status = COMPLETED, escrowStatus = RELEASED
9. Admin payout cho Seller → SellerPayout record
```

### Tách đơn theo Seller

```typescript
// Checkout logic
const cartItems = await prisma.cartItem.findMany({
  where: { userId },
  include: { product: true, variant: true },
})

// Group by sellerId
const bySeller = Map<sellerId, items[]>

for (const [sellerId, items] of bySeller) {
  await prisma.order.create({
    data: {
      userId,
      sellerId,
      orderNumber: generateOrderNumber(),
      // snapshot địa chỉ
      shippingName: selectedAddress.name,
      shippingPhone: selectedAddress.phone,
      // ...
      subtotal: sum(items),
      total: subtotal + shippingFee,
      escrowStatus: "HOLDING",
      items: { create: items.map(toOrderItem) },
    },
  })
}
```

### Status transitions

```
PENDING → CONFIRMED → PROCESSING → SHIPPING → DELIVERED → COMPLETED
                                                         ↘ REFUNDED (nếu hoàn hàng)
PENDING → CANCELLED (trước khi CONFIRMED)
```

---

## 5. Luồng Đặt May (Custom Order)

### Flow chi tiết

```
DRAFT → SUBMITTED → QUOTED → QUOTE_ACCEPTED → DEPOSIT_PAID
     → IN_PROGRESS → REVISION_REQUESTED (loop) → READY
     → COMPLETED
```

**Bước 1 — Customer gửi yêu cầu (SUBMITTED)**

- Chọn shop seller cụ thể
- Điền thông tin: title, description, referenceImages, characterName, deadline
- Đính kèm số đo (Measurement) hoặc nhập mới

**Bước 2 — Seller báo giá (QUOTED)**

- Tạo `CustomOrderQuote` với quotedPrice, depositAmount, estimatedDays
- Customer xem và chấp nhận/từ chối

**Bước 3 — Thanh toán cọc (DEPOSIT_PAID)**

- Customer thanh toán `depositAmount`
- Tạo `Payment` với `paymentType = CUSTOM_DEPOSIT`
- Status → `DEPOSIT_PAID`

**Bước 4 — Gia công (IN_PROGRESS)**

- Seller cập nhật tiến độ qua `CustomOrderProgress`
- Mỗi update có `images[]` và `videos[]` (quay video đo đạc, tiến độ may)
- Customer có thể yêu cầu chỉnh sửa → `REVISION_REQUESTED`
- Seller phản hồi revision → quay lại `IN_PROGRESS`

**Bước 5 — Nghiệm thu (READY)**

- Seller đăng video nghiệm thu cuối vào `CustomOrderProgress`
- Customer xem và xác nhận

**Bước 6 — Thanh toán cuối (COMPLETED)**

- Tính phí ship dựa trên `actualWeight` (cân nặng thực tế)
- Cập nhật `shippingFee` vào `CustomOrder`
- Customer thanh toán `finalAmount + shippingFee - depositAmount`
- Tạo `Payment` với `paymentType = CUSTOM_FINAL`
- Seller giao hàng, cập nhật `trackingCode`

### Lưu ý quan trọng về Ship

```
❌ KHÔNG tính phí ship ở bước Cọc
✅ CHỈ tính phí ship ở bước Final Payment khi có actualWeight
```

`actualWeight` lưu dạng `Int`, đơn vị **gram**. API GHTK/GHN đều nhận số nguyên gram.

```typescript
// Tính final payment
const finalPayment =
  customOrder.finalAmount +
  customOrder.shippingFee - // Tính sau khi có actualWeight (gram)
  customOrder.depositAmount // Trừ cọc đã đóng

// Gọi GHTK API — truyền thẳng, không cần convert
const ghtkPayload = {
  weight: customOrder.actualWeight, // gram, Int, không có thập phân
  // ...
}
```

---

## 6. Luồng Cho Thuê (Rental)

### Flow

```
PENDING → CONFIRMED → DEPOSIT_PAID → READY_FOR_PICKUP
       → RENTED → RETURNED → DEPOSIT_REFUNDED → COMPLETED
                           ↘ (nếu hỏng) → trừ damageFee từ deposit
PENDING → CANCELLED
RENTED → OVERDUE (nếu quá endDate)
```

**Bước 1 — Đặt thuê**

- Customer chọn `startDate`, `endDate`
- Backend kiểm tra overlap (xem mục 3)
- Tạo `RentalOrder`

**Bước 2 — Thanh toán cọc**

- Customer thanh toán `depositAmount`
- `paymentType = RENTAL_DEPOSIT`
- Status → `DEPOSIT_PAID`

**Bước 3 — Nhận đồ (RENTED)**

- Seller/Customer chụp ảnh, quay video tình trạng đồ lúc giao
- Lưu vào `pickupImages[]` và `pickupVideos[]`
- Ghi `conditionAtPickup`

**Bước 4 — Trả đồ (RETURNED)**

- Customer/Seller chụp ảnh, quay video tình trạng đồ lúc trả
- Lưu vào `returnImages[]` và `returnVideos[]`
- Ghi `conditionAtReturn`

**Bước 5 — Tính tiền & Hoàn cọc**

```
refundAmount = depositAmount - damageFee - lateFee

Nếu conditionAtReturn < conditionAtPickup → tính damageFee
Nếu actualReturnDate > endDate → tính lateFee
```

**Bước 6 — Hoàn cọc (DEPOSIT_REFUNDED → COMPLETED)**

- Hoàn `refundAmount` cho customer
- Tạo `Payment` với `paymentType = RENTAL_FEE` (phần phí thuê cho seller)

### Bằng chứng phân xử

Nếu có tranh chấp về tình trạng đồ:

- So sánh `pickupVideos` vs `returnVideos`
- Admin xem xét và quyết định `damageFee`

---

## 7. Thanh toán & Escrow

### Nguyên tắc Escrow

```
Customer thanh toán → Tiền vào tài khoản Admin (HOLDING)
                   → Đơn COMPLETED + không khiếu nại
                   → Admin payout cho Seller (RELEASED)
```

**Không tự động payout.** Admin thực hiện thủ công qua `SellerPayout`.

### SellerPayout

```typescript
// Admin tạo payout
await prisma.sellerPayout.create({
  data: {
    sellerId: seller.id,
    amount: grossAmount,
    platformFee: grossAmount * 0.05, // 5% phí platform
    netAmount: grossAmount * 0.95,
    bankName: seller.bankName,
    bankAccount: seller.bankAccount,
    bankAccountName: seller.bankAccountName,
    status: "PROCESSING",
    processedBy: adminId,
  },
})

// Sau khi chuyển khoản thành công
await prisma.sellerPayout.update({
  where: { id: payoutId },
  data: {
    status: "COMPLETED",
    transferProof: "url_to_proof_image",
    processedAt: new Date(),
  },
})
```

### EscrowStatus trên Order

| Status     | Ý nghĩa                            |
| ---------- | ---------------------------------- |
| `HOLDING`  | Tiền đang giữ tại admin            |
| `RELEASED` | Đã giải phóng, đưa vào payout      |
| `REFUNDED` | Đã hoàn tiền cho buyer (hoàn hàng) |

---

## 8. Hoàn hàng (Return Request)

### Flow

```
Customer tạo ReturnRequest (PENDING)
  → Seller xem xét
  → APPROVED: Seller chấp nhận
      → Backend gọi GHTK API (pick_option = "post")
      → Lấy trackingCode hiển thị cho Customer
      → Customer ghi mã lên hộp, đem ra bưu cục gần nhất
      → Status → SHIPPING_BACK
  → REJECTED: Seller từ chối (kèm lý do)

Seller nhận hàng trả → RECEIVED
Admin xác nhận hoàn tiền → REFUNDED
```

### GHTK Drop-off API

```typescript
// Backend gọi GHTK để tạo đơn hoàn
const response = await ghtkClient.createOrder({
  pick_option: "post", // Khách tự đem ra bưu cục
  from_name: customer.name,
  from_address: customer.shippingAddress,
  // ...
})

await prisma.returnRequest.update({
  where: { id: returnId },
  data: {
    trackingCode: response.tracking_id,
    status: "SHIPPING_BACK",
  },
})

// Hiển thị trackingCode lên UI để khách ghi lên hộp
```

### Bằng chứng

`ReturnRequest` có `images[]` và `videos[]` để customer đính kèm bằng chứng hàng lỗi/sai.

---

## 9. Upload Video/Ảnh

### Kiến trúc: Cloudflare R2 + Pre-signed URL

```
Frontend                Backend              Cloudflare R2
   │                       │                      │
   │  1. Yêu cầu upload    │                      │
   │──────────────────────→│                      │
   │                       │  2. Tạo pre-signed   │
   │                       │     URL (15 phút)    │
   │                       │─────────────────────→│
   │  3. Trả về upload URL │                      │
   │←──────────────────────│                      │
   │                       │                      │
   │  4. Upload trực tiếp file lên R2             │
   │─────────────────────────────────────────────→│
   │                       │                      │
   │  5. Lấy public URL    │                      │
   │  6. Gửi URL về Backend│                      │
   │──────────────────────→│                      │
   │                       │  7. Lưu URL vào DB   │
```

### Backend endpoint

```typescript
// POST /api/upload/presigned
// Trả về pre-signed URL để frontend upload trực tiếp
export async function POST(req: Request) {
  const { fileName, fileType, folder } = await req.json()
  // folder: 'reviews', 'rental', 'custom-order', 'progress'

  const key = `${folder}/${Date.now()}-${fileName}`
  const uploadUrl = await r2.getSignedUrl("putObject", {
    Bucket: process.env.R2_BUCKET,
    Key: key,
    ContentType: fileType,
    Expires: 900, // 15 phút
  })

  return Response.json({
    uploadUrl,
    publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
  })
}
```

### Lưu URL vào DB

Sau khi upload xong, frontend gửi `publicUrl` về backend để lưu vào các cột:

- `Review.videos[]`
- `CustomOrderProgress.videos[]`
- `RentalOrder.pickupVideos[]` / `returnVideos[]`
- `ReturnRequest.videos[]`

---

## 10. Các quy tắc quan trọng

### Tiền tệ

- Tất cả cột giá dùng `Decimal(15, 2)` — hỗ trợ tới 999 tỷ đồng
- Đơn vị: VNĐ (không có ngoại tệ)
- `SystemFee.feeValue` dùng `Decimal(10, 4)` để lưu % chính xác (VD: 5.25%)

### Stock

- **Không** đọc/ghi stock từ `Product`
- **Luôn** đọc/ghi stock từ `ProductVariant`
- Khi trừ stock: dùng transaction để tránh race condition

```typescript
await prisma.$transaction(async (tx) => {
  const variant = await tx.productVariant.findUnique({
    where: { id: variantId },
    select: { stock: true },
  })
  if (variant.stock < quantity) throw new Error("Out of stock")

  await tx.productVariant.update({
    where: { id: variantId },
    data: { stock: { decrement: quantity } },
  })
})
```

### CartItem — variantId bắt buộc

`CartItem.variantId` là `Int` (không nullable). Mọi product **bắt buộc** có ít nhất 1 `ProductVariant` với `isDefault = true`.

```typescript
// Khi tạo product không có biến thể
await prisma.product.create({
  data: {
    // ...
    variants: {
      create: [
        {
          name: "Mặc định",
          stock: 10,
          isDefault: true,
          attributes: {},
        },
      ],
    },
  },
})

// Khi thêm vào giỏ hàng — luôn có variantId
await prisma.cartItem.create({
  data: {
    userId,
    productId,
    variantId, // Bắt buộc, không được null
    quantity,
  },
})
```

### Conversation — thứ tự user1Id/user2Id

`@@unique([user1Id, user2Id])` — PostgreSQL phân biệt `[1, 2]` và `[2, 1]`.

**Bắt buộc** trong mọi đoạn code tạo/query conversation:

```typescript
// Luôn sắp xếp ID nhỏ hơn lên trước
const user1Id = Math.min(userA, userB)
const user2Id = Math.max(userA, userB)

const conversation = await prisma.conversation.upsert({
  where: { user1Id_user2Id: { user1Id, user2Id } },
  create: { user1Id, user2Id },
  update: {},
})
```

### Review — trỏ về OrderItem

`Review.orderItemId` trỏ về `OrderItem` (không phải `Order`) để biết chính xác variant nào được đánh giá.

```typescript
// Kiểm tra quyền review: user phải có orderItem đã mua
const orderItem = await prisma.orderItem.findFirst({
  where: {
    id: orderItemId,
    order: {
      userId,
      status: "COMPLETED",
    },
  },
})
if (!orderItem) throw new Error("Bạn chưa mua sản phẩm này")

await prisma.review.create({
  data: {
    userId,
    productId: orderItem.productId,
    orderItemId: orderItem.id, // Trỏ về item cụ thể
    rating,
    content,
  },
})
```

### Rental Availability

- **Không** dùng `unavailableDates` (đã xóa)
- **Luôn** query overlap trên `RentalOrder` để kiểm tra

### Địa chỉ

- **Không** đọc địa chỉ từ `User.savedAddresses` cho đơn hàng đã tạo
- **Luôn** đọc từ snapshot trong `Order.shippingAddress` etc.

### Payout

- **Không** tự động payout
- Admin thực hiện thủ công sau khi đơn `COMPLETED`
- Kiểm tra `escrowStatus = HOLDING` trước khi payout

---

## Sơ đồ quan hệ nhanh

```
User (CUSTOMER) ──→ Order ──→ OrderItem ──→ Product ──→ ProductVariant (stock)
                 ──→ CustomOrder ──→ CustomOrderQuote
                 ──→ RentalOrder ──→ RentalItem ──→ Product
                 ──→ ReturnRequest

User (SELLER) ──→ Product
              ──→ RentalItem
              ──→ SellerPayout ←── Order (escrowStatus = RELEASED)

Payment ──→ Order | CustomOrder | RentalOrder
```

---

_Cập nhật lần cuối: 12/05/2026_
