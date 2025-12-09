-- Міграція для додавання індексів для швидкого пошуку по локалізованим полям
-- Виконується автоматично через: npx prisma migrate dev --name add_i18n_indexes

-- Встановлюємо розширення для full-text search (якщо ще не встановлено)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Індекси для швидкого пошуку по назвах страв
CREATE INDEX IF NOT EXISTS idx_dish_name_trgm ON "Dish" USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_dish_name_en_trgm ON "Dish" USING gin("nameEn" gin_trgm_ops);

-- Індекси для пошуку по описах страв
CREATE INDEX IF NOT EXISTS idx_dish_description_trgm ON "Dish" USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_dish_description_en_trgm ON "Dish" USING gin("descriptionEn" gin_trgm_ops);

-- Індекси для категорій
CREATE INDEX IF NOT EXISTS idx_category_name_trgm ON "Category" USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_category_name_en_trgm ON "Category" USING gin("nameEn" gin_trgm_ops);

-- Композитний індекс для пошуку по ресторану та назві
CREATE INDEX IF NOT EXISTS idx_dish_restaurant_name ON "Dish"("restaurantId", name);
CREATE INDEX IF NOT EXISTS idx_dish_restaurant_name_en ON "Dish"("restaurantId", "nameEn");

-- Примітка: GIN індекси займають більше місця, але значно прискорюють ILIKE пошук
-- Для малих таблиць (< 10k записів) можна використовувати звичайні B-tree індекси

