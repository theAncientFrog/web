// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocaleFromRequest, localizeEntities, type SupportedLocale } from '@/lib/i18n-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Необхідно вказати "restaurantId"' },
        { status: 400 }
      );
    }

    // Визначаємо локаль з запиту
    const locale = getLocaleFromRequest(request);

    const numericRestaurantId = Number(restaurantId);

    // Отримуємо головні категорії з підкатегоріями
    const mainCategories = await prisma.category.findMany({
      where: {
        restaurantId: numericRestaurantId,
        parentId: null, // Тільки головні категорії
      },
      select: {
        id: true,
        name: true,
        nameEn: true, // Додано для локалізації
        description: true,
        descriptionEn: true, // Додано для локалізації
        type: true,
        subcategories: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            description: true,
            descriptionEn: true,
            type: true,
            _count: {
              select: {
                dishes: true,
              },
            },
          },
        },
        _count: {
          select: {
            dishes: true,
          },
        },
      },
      orderBy: {
        type: 'asc',
      },
    });

    // Форматуємо відповідь з локалізацією
    const formattedCategories = mainCategories.map((category) => {
      // Локалізуємо головну категорію
      const localizedMain = localizeEntities([category], locale)[0];
      
      // Локалізуємо підкатегорії
      const localizedSubs = localizeEntities(category.subcategories, locale);

      return {
        id: category.id,
        name: localizedMain.name,
        description: localizedMain.description,
        type: category.type,
        subcategories: localizedSubs.map((sub) => ({
          id: sub.id,
          name: sub.name,
          description: sub.description,
          dishCount: category.subcategories.find(s => s.id === sub.id)?._count.dishes || 0,
        })),
        dishCount: category._count.dishes,
      };
    });

    return NextResponse.json(formattedCategories, {
      status: 200,
      headers: {
        'Content-Language': locale,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Vary': 'Accept-Language, x-lang',
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
