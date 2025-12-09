/**
 * Helper функції для пошуку по локалізованих даних
 * 
 * Підтримує full-text search по обох мовах одночасно
 */

import { prisma } from './prisma';
import { type SupportedLocale, localizeEntities } from './i18n-helpers';

/**
 * Пошук страв по назві або опису (українською та англійською)
 * 
 * @param query - Пошуковий запит
 * @param locale - Поточна локаль
 * @param restaurantId - ID ресторану
 * @returns Масив знайдених страв
 */
export async function searchDishes(
  query: string,
  locale: SupportedLocale,
  restaurantId: number
) {
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) {
    return [];
  }

  // Пошук по обох мовах одночасно
  const dishes = await prisma.dish.findMany({
    where: {
      restaurantId,
      OR: [
        // Пошук по українській назві
        { name: { contains: searchTerm, mode: 'insensitive' } },
        // Пошук по англійській назві
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        // Пошук по українському опису
        { description: { contains: searchTerm, mode: 'insensitive' } },
        // Пошук по англійському опису
        { descriptionEn: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      nameEn: true,
      description: true,
      descriptionEn: true,
      allergens: true,
      allergensEn: true,
      price: true,
      calories: true,
      imageUrl: true,
      categoryId: true,
    },
    take: 50, // Обмежуємо результат
  });

  // Локалізуємо результати пошуку
  return localizeEntities(dishes, locale);
}

/**
 * Оптимізований пошук з використанням PostgreSQL full-text search
 * (потребує налаштування індексів)
 * 
 * Для використання потрібно:
 * 1. Встановити розширення pg_trgm: CREATE EXTENSION IF NOT EXISTS pg_trgm;
 * 2. Створити індекси (див. міграцію)
 */
export async function searchDishesFullText(
  query: string,
  locale: SupportedLocale,
  restaurantId: number
) {
  const searchTerm = query.trim();

  if (!searchTerm) {
    return [];
  }

  // Використовуємо raw SQL для full-text search
  const dishes = await prisma.$queryRaw<Array<{
    id: number;
    name: string;
    nameEn: string | null;
    description: string | null;
    descriptionEn: string | null;
    price: number;
    calories: number | null;
    imageUrl: string | null;
    categoryId: number;
  }>>`
    SELECT 
      d.id,
      d.name,
      d."nameEn",
      d.description,
      d."descriptionEn",
      d.allergens,
      d."allergensEn",
      d.price,
      d.calories,
      d."imageUrl",
      d."categoryId"
    FROM "Dish" d
    WHERE d."restaurantId" = ${restaurantId}
      AND (
        d.name ILIKE ${`%${searchTerm}%`}
        OR d."nameEn" ILIKE ${`%${searchTerm}%`}
        OR d.description ILIKE ${`%${searchTerm}%`}
        OR d."descriptionEn" ILIKE ${`%${searchTerm}%`}
      )
    ORDER BY 
      CASE 
        WHEN d.name ILIKE ${`%${searchTerm}%`} THEN 1
        WHEN d."nameEn" ILIKE ${`%${searchTerm}%`} THEN 2
        ELSE 3
      END
    LIMIT 50
  `;

  // Локалізуємо результати пошуку
  return localizeEntities(dishes, locale);
}

