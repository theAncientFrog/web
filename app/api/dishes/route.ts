// app/api/dishes/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('category');
    const restaurantId = searchParams.get('restaurantId');

    if (!categoryName || !restaurantId) {
      return NextResponse.json(
        { error: 'Необхідно вказати "category" та "restaurantId"' },
        { status: 400 }
      );
    }

    const numericRestaurantId = Number(restaurantId);
    let dishes = [];

    // Спочатку перевіряємо, чи це назва головної категорії
    if (categoryName === 'Їжа') {
      // Повертаємо всі страви з підкатегорій їжі
      dishes = await prisma.dish.findMany({
        where: {
          category: {
            parent: {
              name: 'Їжа',
              restaurantId: numericRestaurantId
            }
          }
        }
      });
    } else if (categoryName === 'Напої') {
      // Повертаємо всі страви з підкатегорій напоїв
      dishes = await prisma.dish.findMany({
        where: {
          category: {
            parent: {
              name: 'Напої',
              restaurantId: numericRestaurantId
            }
          }
        }
      });
    } else if (categoryName === 'Алкоголь') {
      // Повертаємо всі страви з підкатегорій алкоголю
      dishes = await prisma.dish.findMany({
        where: {
          category: {
            parent: {
              name: 'Алкоголь',
              restaurantId: numericRestaurantId
            }
          }
        }
      });
    } else if (categoryName === 'Мерч') {
      // Повертаємо всі страви з підкатегорій мерчу
      dishes = await prisma.dish.findMany({
        where: {
          category: {
            parent: {
              name: 'Мерч',
              restaurantId: numericRestaurantId
            }
          }
        }
      });
    } else {
      // Шукаємо в конкретній субкатегорії
      dishes = await prisma.dish.findMany({
        where: {
          category: {
            name: categoryName,
            restaurantId: numericRestaurantId
          }
        }
      });
    }

    return NextResponse.json(dishes, { status: 200 });
  } catch (error) {
    console.error('Error fetching dishes:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}



