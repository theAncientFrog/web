// app/api/menu/[restaurantId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocaleFromRequest, localizeEntities, localizeEntity } from '@/lib/i18n-helpers';

// Вказуємо Next.js, що цей роут завжди динамічний (для Vercel)
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = context.params;
    const numericRestaurantId = parseInt(restaurantId);

    if (isNaN(numericRestaurantId)) {
        return NextResponse.json({ message: 'Invalid Restaurant ID' }, { status: 400 });
    }

    // Визначаємо локаль з запиту
    const locale = getLocaleFromRequest(request);

    const restaurantWithMenu = await prisma.restaurant.findUnique({
      where: {
        id: numericRestaurantId,
      },
      select: { 
          id: true,
          name: true,
          nameEn: true,
          description: true,
          descriptionEn: true,
          bannerUrl: true, 
          logoUrl: true,    
          address: true, 
          categories: {
              select: {
                  id: true,
                  name: true,
                  nameEn: true,
                  description: true,
                  descriptionEn: true,
                  dishes: {
                      select: {
                          id: true,
                          name: true,
                          nameEn: true,
                          description: true,
                          descriptionEn: true,
                          price: true,
                          calories: true,
                          allergens: true,
                          allergensEn: true,
                          imageUrl: true,
                      }
                  }
              }
          }
      },
    });

    if (!restaurantWithMenu) {
      return NextResponse.json(
        { message: 'Ресторан не знайдено' },
        { status: 404 }
      );
    }
    
    // Локалізуємо ресторан
    const localizedRestaurantData = localizeEntity(restaurantWithMenu, locale);
    
    // Локалізуємо категорії та страви
    const localizedCategories = restaurantWithMenu.categories.map(category => {
      const localizedCategory = localizeEntities([category], locale)[0];
      const localizedDishes = localizeEntities(category.dishes, locale);
      
      return {
        ...localizedCategory,
        dishes: localizedDishes,
      };
    });
    
    const localizedRestaurant = {
      ...localizedRestaurantData,
      categories: localizedCategories,
      bannerUrl: restaurantWithMenu.bannerUrl,
      logoUrl: restaurantWithMenu.logoUrl,
      address: restaurantWithMenu.address,
    };
    
    return NextResponse.json(localizedRestaurant, {
      headers: {
        'Content-Language': locale,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Vary': 'Accept-Language, x-lang',
      }
    });
  } catch (error) {
    console.error('Помилка при отриманні меню:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}