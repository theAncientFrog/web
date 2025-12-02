// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const numericRestaurantId = Number(restaurantId);

    // Отримуємо всі головні категорії з підкатегоріями та стравами
    const mainCategories = await prisma.category.findMany({
      where: {
        restaurantId: numericRestaurantId,
        parentId: null, // Тільки головні категорії
      },
      include: {
        subcategories: {
          include: {
            dishes: true,
          },
        },
        dishes: true,
      },
    });

    // Перетворюємо структуру для сумісності з існуючим фронтендом
    const formattedCategories = mainCategories.map(mainCat => ({
      id: mainCat.id, // Використовуємо числовий ID з бази даних
      name: mainCat.name,
      subcategories: mainCat.subcategories.map(subCat => ({
        id: subCat.id,
        name: subCat.name,
        dishes: subCat.dishes
      }))
    }));

    return NextResponse.json(formattedCategories, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

