-- Додаємо поля для англійської мови до таблиці Restaurant
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurant' AND column_name='nameEn') THEN
        ALTER TABLE "Restaurant" ADD COLUMN "nameEn" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurant' AND column_name='descriptionEn') THEN
        ALTER TABLE "Restaurant" ADD COLUMN "descriptionEn" TEXT;
    END IF;
END $$;

-- Додаємо поле для англійської мови до таблиці Dish (allergensEn)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Dish' AND column_name='allergensEn') THEN
        ALTER TABLE "Dish" ADD COLUMN "allergensEn" TEXT;
    END IF;
END $$;

