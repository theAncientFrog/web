// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId is required' },
        { status: 400 }
      );
    }

    const numericRestaurantId = parseInt(restaurantId);
    if (isNaN(numericRestaurantId)) {
      return NextResponse.json(
        { error: 'Invalid restaurantId' },
        { status: 400 }
      );
    }

    console.log(`[Categories API] Fetching categories for restaurantId: ${numericRestaurantId}`);

    // Отримуємо всі головні категорії (parentId === null) з підкатегоріями
    const mainCategories = await prisma.category.findMany({
      where: {
        restaurantId: numericRestaurantId,
        parentId: null, // Тільки головні категорії
      },
      include: {
        subcategories: {
          include: {
            _count: {
              select: {
                dishes: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            dishes: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`[Categories API] Found ${mainCategories.length} main categories`);

    // Форматуємо відповідь
    const formattedCategories = mainCategories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      type: category.type,
      subcategories: category.subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        dishCount: sub._count.dishes,
      })),
      dishCount: category._count.dishes,
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
