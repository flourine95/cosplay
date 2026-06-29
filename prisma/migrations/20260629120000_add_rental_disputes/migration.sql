CREATE TYPE "RentalDisputeStatus" AS ENUM (
  'OPEN',
  'SHOP_RESPONDED',
  'ADMIN_REVIEWING',
  'RESOLVED_REFUND_CUSTOMER',
  'RESOLVED_PAY_SHOP',
  'RESOLVED_SPLIT',
  'CLOSED'
);

CREATE TABLE "RentalDispute" (
  "id" SERIAL NOT NULL,
  "rentalOrderId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "sellerId" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "images" TEXT[],
  "status" "RentalDisputeStatus" NOT NULL DEFAULT 'OPEN',
  "shopResponse" TEXT,
  "adminNote" TEXT,
  "refundAmount" DECIMAL(15,2),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RentalDispute_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RentalDispute_rentalOrderId_idx" ON "RentalDispute"("rentalOrderId");
CREATE INDEX "RentalDispute_userId_idx" ON "RentalDispute"("userId");
CREATE INDEX "RentalDispute_sellerId_idx" ON "RentalDispute"("sellerId");
CREATE INDEX "RentalDispute_status_idx" ON "RentalDispute"("status");

ALTER TABLE "RentalDispute"
  ADD CONSTRAINT "RentalDispute_rentalOrderId_fkey"
  FOREIGN KEY ("rentalOrderId") REFERENCES "RentalOrder"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
