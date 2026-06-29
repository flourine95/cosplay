UPDATE "RentalItem" AS ri
SET "depositAmount" = p."price"
FROM "Product" AS p
WHERE ri."productId" = p."id";
