-- Скрипт для ручного застосування міграції багатомовності
-- Виконайте цей SQL напряму в базі даних

-- Додаємо поля для англійської мови до таблиці Category
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Category' AND column_name='nameEn') THEN
        ALTER TABLE "Category" ADD COLUMN "nameEn" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Category' AND column_name='descriptionEn') THEN
        ALTER TABLE "Category" ADD COLUMN "descriptionEn" TEXT;
    END IF;
END $$;

-- Додаємо поля для англійської мови до таблиці Dish
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Dish' AND column_name='nameEn') THEN
        ALTER TABLE "Dish" ADD COLUMN "nameEn" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Dish' AND column_name='descriptionEn') THEN
        ALTER TABLE "Dish" ADD COLUMN "descriptionEn" TEXT;
    END IF;
END $$;

