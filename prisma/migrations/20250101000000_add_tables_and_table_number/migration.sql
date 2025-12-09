-- AlterTable
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Order' AND column_name='tableNumber') THEN
        ALTER TABLE "Order" ADD COLUMN "tableNumber" TEXT;
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Table" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "qrCodeUrl" TEXT,
    "restaurantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Table_restaurantId_number_key" ON "Table"("restaurantId", "number");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='Table_restaurantId_fkey' AND table_name='Table'
    ) THEN
        ALTER TABLE "Table" ADD CONSTRAINT "Table_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;









