-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'SELLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "SellerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SALE', 'RENTAL', 'BOTH');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'ZALOPAY', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('HOLDING', 'RELEASED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SHIPPING_BACK', 'RECEIVED', 'REFUNDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReturnReason" AS ENUM ('WRONG_ITEM', 'DAMAGED', 'NOT_AS_DESCRIBED', 'MISSING_PARTS', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ORDER', 'CUSTOM_DEPOSIT', 'CUSTOM_FINAL', 'RENTAL_DEPOSIT', 'RENTAL_FEE');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CustomOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'QUOTED', 'QUOTE_ACCEPTED', 'DEPOSIT_PAID', 'IN_PROGRESS', 'REVISION_REQUESTED', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DEPOSIT_PAID', 'READY_FOR_PICKUP', 'RENTED', 'RETURNED', 'DEPOSIT_REFUNDED', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "RentalItemCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_STATUS', 'PAYMENT', 'CUSTOM_ORDER', 'RENTAL', 'REVIEW', 'SYSTEM', 'PROMOTION');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "savedAddresses" JSONB NOT NULL DEFAULT '[]',
    "shopName" TEXT,
    "shopDescription" TEXT,
    "shopLogo" TEXT,
    "shopBanner" TEXT,
    "businessLicense" TEXT,
    "taxCode" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankAccountName" TEXT,
    "sellerStatus" "SellerStatus",
    "sellerApprovedAt" TIMESTAMP(3),
    "sellerApprovedBy" INTEGER,
    "sellerRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellerTotalReviews" INTEGER NOT NULL DEFAULT 0,
    "sellerTotalSales" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "parentId" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "comparePrice" DECIMAL(15,2),
    "sku" TEXT,
    "type" "ProductType" NOT NULL DEFAULT 'SALE',
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "tags" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "price" DECIMAL(15,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "attributes" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "shippingName" TEXT NOT NULL,
    "shippingPhone" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "shippingCity" TEXT NOT NULL,
    "shippingDistrict" TEXT NOT NULL,
    "shippingWard" TEXT NOT NULL,
    "shippingNote" TEXT,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "shippingFee" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "escrowStatus" "EscrowStatus" NOT NULL DEFAULT 'HOLDING',
    "payoutId" INTEGER,
    "customerNote" TEXT,
    "adminNote" TEXT,
    "trackingCode" TEXT,
    "shippingCarrier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnRequest" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" "ReturnReason" NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "videos" TEXT[],
    "status" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "trackingCode" TEXT,
    "shippingCarrier" TEXT DEFAULT 'GHTK',
    "sellerNote" TEXT,
    "adminNote" TEXT,
    "refundAmount" DECIMAL(15,2),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER,
    "customOrderId" INTEGER,
    "rentalOrderId" INTEGER,
    "amount" DECIMAL(15,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "transactionData" JSONB,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerPayout" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "platformFee" DECIMAL(15,2) NOT NULL,
    "netAmount" DECIMAL(15,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankAccountName" TEXT,
    "transferNote" TEXT,
    "transferProof" TEXT,
    "processedBy" INTEGER,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "orderItemId" INTEGER,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "images" TEXT[],
    "videos" TEXT[],
    "sellerReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "content" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "chest" DOUBLE PRECISION,
    "waist" DOUBLE PRECISION,
    "hips" DOUBLE PRECISION,
    "shoulder" DOUBLE PRECISION,
    "armLength" DOUBLE PRECISION,
    "legLength" DOUBLE PRECISION,
    "neck" DOUBLE PRECISION,
    "additionalMeasurements" JSONB,
    "notes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrder" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "measurementId" INTEGER,
    "orderNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "referenceImages" TEXT[],
    "characterName" TEXT,
    "animeName" TEXT,
    "specialRequests" TEXT,
    "deadline" TIMESTAMP(3),
    "status" "CustomOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "estimatedPrice" DECIMAL(15,2),
    "depositAmount" DECIMAL(15,2),
    "finalAmount" DECIMAL(15,2),
    "totalPaid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "shippingFee" DECIMAL(15,2),
    "trackingCode" TEXT,
    "shippingCarrier" TEXT,
    "actualWeight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CustomOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrderQuote" (
    "id" SERIAL NOT NULL,
    "customOrderId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "quotedPrice" DECIMAL(15,2) NOT NULL,
    "depositAmount" DECIMAL(15,2) NOT NULL,
    "estimatedDays" INTEGER NOT NULL,
    "description" TEXT,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "isRejected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrderQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrderProgress" (
    "id" SERIAL NOT NULL,
    "customOrderId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "videos" TEXT[],
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomOrderProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrderRevision" (
    "id" SERIAL NOT NULL,
    "customOrderId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "videos" TEXT[],
    "sellerResponse" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomOrderRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalItem" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "pricePerDay" DECIMAL(15,2) NOT NULL,
    "depositAmount" DECIMAL(15,2) NOT NULL,
    "minDays" INTEGER NOT NULL DEFAULT 1,
    "maxDays" INTEGER,
    "condition" "RentalItemCondition" NOT NULL DEFAULT 'EXCELLENT',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalOrder" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rentalItemId" INTEGER NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "actualReturnDate" TIMESTAMP(3),
    "pricePerDay" DECIMAL(15,2) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "rentalFee" DECIMAL(15,2) NOT NULL,
    "depositAmount" DECIMAL(15,2) NOT NULL,
    "lateFee" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "damageFee" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "refundAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "RentalStatus" NOT NULL DEFAULT 'PENDING',
    "conditionAtPickup" "RentalItemCondition",
    "pickupNotes" TEXT,
    "pickupImages" TEXT[],
    "pickupVideos" TEXT[],
    "conditionAtReturn" "RentalItemCondition",
    "returnNotes" TEXT,
    "returnImages" TEXT[],
    "returnVideos" TEXT[],
    "damageDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "RentalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "link" TEXT,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemFee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "feeType" TEXT NOT NULL,
    "feeValue" DECIMAL(10,4) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "user1Id" INTEGER NOT NULL,
    "user2Id" INTEGER NOT NULL,
    "orderId" INTEGER,
    "customOrderId" INTEGER,
    "rentalOrderId" INTEGER,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_sellerStatus_idx" ON "User"("sellerStatus");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_token_idx" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_sku_idx" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_productId_variantId_key" ON "CartItem"("userId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_sellerId_idx" ON "Order"("sellerId");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_escrowStatus_idx" ON "Order"("escrowStatus");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");

-- CreateIndex
CREATE INDEX "ReturnRequest_orderId_idx" ON "ReturnRequest"("orderId");

-- CreateIndex
CREATE INDEX "ReturnRequest_userId_idx" ON "ReturnRequest"("userId");

-- CreateIndex
CREATE INDEX "ReturnRequest_status_idx" ON "ReturnRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_customOrderId_idx" ON "Payment"("customOrderId");

-- CreateIndex
CREATE INDEX "Payment_rentalOrderId_idx" ON "Payment"("rentalOrderId");

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "SellerPayout_sellerId_idx" ON "SellerPayout"("sellerId");

-- CreateIndex
CREATE INDEX "SellerPayout_status_idx" ON "SellerPayout"("status");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_orderItemId_idx" ON "Review"("orderItemId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_productId_idx" ON "Comment"("productId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Measurement_userId_idx" ON "Measurement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomOrder_orderNumber_key" ON "CustomOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "CustomOrder_userId_idx" ON "CustomOrder"("userId");

-- CreateIndex
CREATE INDEX "CustomOrder_sellerId_idx" ON "CustomOrder"("sellerId");

-- CreateIndex
CREATE INDEX "CustomOrder_orderNumber_idx" ON "CustomOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "CustomOrder_status_idx" ON "CustomOrder"("status");

-- CreateIndex
CREATE INDEX "CustomOrderQuote_customOrderId_idx" ON "CustomOrderQuote"("customOrderId");

-- CreateIndex
CREATE INDEX "CustomOrderQuote_sellerId_idx" ON "CustomOrderQuote"("sellerId");

-- CreateIndex
CREATE INDEX "CustomOrderProgress_customOrderId_idx" ON "CustomOrderProgress"("customOrderId");

-- CreateIndex
CREATE INDEX "CustomOrderRevision_customOrderId_idx" ON "CustomOrderRevision"("customOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "RentalItem_productId_key" ON "RentalItem"("productId");

-- CreateIndex
CREATE INDEX "RentalItem_sellerId_idx" ON "RentalItem"("sellerId");

-- CreateIndex
CREATE INDEX "RentalItem_isAvailable_idx" ON "RentalItem"("isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "RentalOrder_orderNumber_key" ON "RentalOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "RentalOrder_userId_idx" ON "RentalOrder"("userId");

-- CreateIndex
CREATE INDEX "RentalOrder_rentalItemId_idx" ON "RentalOrder"("rentalItemId");

-- CreateIndex
CREATE INDEX "RentalOrder_orderNumber_idx" ON "RentalOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "RentalOrder_status_idx" ON "RentalOrder"("status");

-- CreateIndex
CREATE INDEX "RentalOrder_startDate_endDate_idx" ON "RentalOrder"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemFee_name_key" ON "SystemFee"("name");

-- CreateIndex
CREATE INDEX "SystemFee_name_idx" ON "SystemFee"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_key_idx" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "Conversation_user1Id_idx" ON "Conversation"("user1Id");

-- CreateIndex
CREATE INDEX "Conversation_user2Id_idx" ON "Conversation"("user2Id");

-- CreateIndex
CREATE INDEX "Conversation_orderId_idx" ON "Conversation"("orderId");

-- CreateIndex
CREATE INDEX "Conversation_customOrderId_idx" ON "Conversation"("customOrderId");

-- CreateIndex
CREATE INDEX "Conversation_rentalOrderId_idx" ON "Conversation"("rentalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_user1Id_user2Id_key" ON "Conversation"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "SellerPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "RentalOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerPayout" ADD CONSTRAINT "SellerPayout_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrder" ADD CONSTRAINT "CustomOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrder" ADD CONSTRAINT "CustomOrder_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrder" ADD CONSTRAINT "CustomOrder_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "Measurement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderQuote" ADD CONSTRAINT "CustomOrderQuote_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderQuote" ADD CONSTRAINT "CustomOrderQuote_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderProgress" ADD CONSTRAINT "CustomOrderProgress_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderRevision" ADD CONSTRAINT "CustomOrderRevision_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalItem" ADD CONSTRAINT "RentalItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalItem" ADD CONSTRAINT "RentalItem_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrder" ADD CONSTRAINT "RentalOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrder" ADD CONSTRAINT "RentalOrder_rentalItemId_fkey" FOREIGN KEY ("rentalItemId") REFERENCES "RentalItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

