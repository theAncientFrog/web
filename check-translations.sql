-- Скрипт для перевірки наявності перекладів у базі даних
-- Використання: виконайте цей SQL у вашому PostgreSQL клієнті або через psql

-- 1. Перевірка категорій без англійських перекладів
SELECT 
    'Category' as table_name,
    id,
    name as ukrainian_name,
    "nameEn" as english_name,
    CASE 
        WHEN "nameEn" IS NULL OR "nameEn" = '' THEN '❌ Немає перекладу'
        ELSE '✅ Є переклад'
    END as translation_status
FROM "Category"
WHERE "nameEn" IS NULL OR "nameEn" = ''
ORDER BY id
LIMIT 20;

-- 2. Перевірка страв без англійських перекладів
SELECT 
    'Dish' as table_name,
    id,
    name as ukrainian_name,
    "nameEn" as english_name,
    CASE 
        WHEN "nameEn" IS NULL OR "nameEn" = '' THEN '❌ Немає перекладу назви'
        ELSE '✅ Є переклад назви'
    END as name_translation,
    CASE 
        WHEN "descriptionEn" IS NULL OR "descriptionEn" = '' THEN '❌ Немає перекладу опису'
        ELSE '✅ Є переклад опису'
    END as description_translation
FROM "Dish"
WHERE "nameEn" IS NULL OR "nameEn" = '' OR "descriptionEn" IS NULL OR "descriptionEn" = ''
ORDER BY id
LIMIT 20;

-- 3. Статистика перекладів
SELECT 
    'Category' as table_name,
    COUNT(*) as total_count,
    COUNT("nameEn") as with_english_name,
    COUNT(*) - COUNT("nameEn") as missing_english_name,
    ROUND(100.0 * COUNT("nameEn") / COUNT(*), 2) as translation_percentage
FROM "Category"
UNION ALL
SELECT 
    'Dish' as table_name,
    COUNT(*) as total_count,
    COUNT("nameEn") as with_english_name,
    COUNT(*) - COUNT("nameEn") as missing_english_name,
    ROUND(100.0 * COUNT("nameEn") / COUNT(*), 2) as translation_percentage
FROM "Dish"
UNION ALL
SELECT 
    'Restaurant' as table_name,
    COUNT(*) as total_count,
    COUNT("nameEn") as with_english_name,
    COUNT(*) - COUNT("nameEn") as missing_english_name,
    ROUND(100.0 * COUNT("nameEn") / COUNT(*), 2) as translation_percentage
FROM "Restaurant";

