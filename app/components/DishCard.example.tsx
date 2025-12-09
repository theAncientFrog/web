/**
 * Приклад компонента для відображення страви з підтримкою i18n
 * 
 * Два варіанти:
 * 1. Client Component (поточний приклад)
 * 2. Server Component (коментарі нижче)
 */

'use client';

import { useLocale } from '@/hooks/useLocale';
import Image from 'next/image';

interface Dish {
  id: number;
  name: string;
  description?: string;
  price: number;
  calories?: number;
  imageUrl?: string;
}

interface DishCardProps {
  dish: Dish;
  restaurantId: number;
}

/**
 * ВАРІАНТ 1: Client Component
 * Використовується для інтерактивних компонентів з useState/useEffect
 */
export function DishCard({ dish, restaurantId }: DishCardProps) {
  const { getLocalizedValue } = useLocale();

  // Локалізація відбувається на клієнті
  // API вже повертає локалізовані дані, але можна додати fallback
  const dishName = dish.name || 'Без назви';
  const dishDescription = dish.description || '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {dish.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={dish.imageUrl}
            alt={dishName}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {dishName}
        </h3>
        {dishDescription && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {dishDescription}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-green-600 dark:text-green-400">
            {dish.price.toFixed(2)} грн
          </span>
          {dish.calories && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dish.calories} ккал
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ВАРІАНТ 2: Server Component (рекомендовано для статичних даних)
 * 
 * Використання:
 * 
 * // app/menu/[restaurantId]/page.tsx
 * import { getLocaleFromRequest } from '@/lib/i18n-helpers';
 * import { headers } from 'next/headers';
 * 
 * export default async function MenuPage({ params }: { params: { restaurantId: string } }) {
 *   const headersList = await headers();
 *   const locale = getLocaleFromRequest({ headers: headersList });
 *   
 *   const dishes = await prisma.dish.findMany({
 *     where: { restaurantId: Number(params.restaurantId) }
 *   });
 *   
 *   const localizedDishes = localizeEntities(dishes, locale);
 *   
 *   return (
 *     <div>
 *       {localizedDishes.map(dish => (
 *         <DishCardServer key={dish.id} dish={dish} />
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * async function DishCardServer({ dish }: { dish: Dish }) {
 *   return (
 *     <div>
 *       <h3>{dish.name}</h3>
 *       <p>{dish.description}</p>
 *     </div>
 *   );
 * }
 */

