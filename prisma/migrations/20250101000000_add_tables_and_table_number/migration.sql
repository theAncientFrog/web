-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "tableNumber" TEXT;

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
ALTER TABLE "Table" ADD CONSTRAINT IF NOT EXISTS "Table_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;







