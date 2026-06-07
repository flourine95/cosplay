-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "rentDays" INTEGER,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'Mua';
