-- CreateEnum (якщо не існує)
DO $$ BEGIN
    CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Додаємо tableNumber, якщо його немає
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "tableNumber" TEXT;

-- Конвертуємо status з TEXT в enum (якщо він існує як TEXT)
DO $$ 
BEGIN
    -- Перевіряємо, чи існує колонка status як TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'status' 
        AND data_type = 'text'
    ) THEN
        -- Видаляємо стару колонку
        ALTER TABLE "Order" DROP COLUMN "status";
        -- Додаємо нову колонку з enum
        ALTER TABLE "Order" ADD COLUMN "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'status'
    ) THEN
        -- Якщо колонки немає взагалі, додаємо її
        ALTER TABLE "Order" ADD COLUMN "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';
    END IF;
END $$;

