ALTER TABLE "User"
ADD COLUMN "shopReturnName" TEXT,
ADD COLUMN "shopReturnPhone" TEXT,
ADD COLUMN "shopReturnAddress" TEXT,
ADD COLUMN "shopReturnCity" TEXT,
ADD COLUMN "shopReturnDistrict" TEXT,
ADD COLUMN "shopReturnWard" TEXT,
ADD COLUMN "shopReturnNote" TEXT;

ALTER TABLE "RentalOrder"
ADD COLUMN "returnName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "returnPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN "returnAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN "returnCity" TEXT NOT NULL DEFAULT '',
ADD COLUMN "returnDistrict" TEXT NOT NULL DEFAULT '',
ADD COLUMN "returnWard" TEXT NOT NULL DEFAULT '',
ADD COLUMN "returnAddressNote" TEXT;

UPDATE "User"
SET
  "shopReturnName" = COALESCE("shopReturnName", "shopName", "name"),
  "shopReturnPhone" = COALESCE("shopReturnPhone", "phone", ''),
  "shopReturnAddress" = COALESCE("shopReturnAddress", 'Dia chi shop chua cap nhat'),
  "shopReturnCity" = COALESCE("shopReturnCity", 'Chua cap nhat'),
  "shopReturnDistrict" = COALESCE("shopReturnDistrict", 'Chua cap nhat'),
  "shopReturnWard" = COALESCE("shopReturnWard", 'Chua cap nhat')
WHERE "role" = 'SELLER';
