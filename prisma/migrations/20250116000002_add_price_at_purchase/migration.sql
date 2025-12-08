-- Додаємо priceAtPurchase, якщо його немає
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "priceAtPurchase" DOUBLE PRECISION;

-- Оновлюємо існуючі записи, встановлюючи priceAtPurchase = price, якщо priceAtPurchase NULL
UPDATE "OrderItem" SET "priceAtPurchase" = "price" WHERE "priceAtPurchase" IS NULL;

-- Робимо поле обов'язковим (якщо всі записи мають значення)
ALTER TABLE "OrderItem" ALTER COLUMN "priceAtPurchase" SET NOT NULL;

