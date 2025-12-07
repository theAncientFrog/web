// app/api/menu/[restaurantId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const restaurantWithMenu = await prisma.restaurant.findUnique({
      where: {
        id: numericRestaurantId,
      },
      select: { 
          id: true,
          name: true,
          description: true,
          // ⬅️ Додано: нові поля
          bannerUrl: true, 
          logoUrl: true,    
          // ⬅️ Додано: address
          address: true, 
          categories: {
              select: {
                  id: true,
                  name: true,
                  // Для цього MenuPage нам не потрібні dishes, але залишаємо для повноти:
                  dishes: true 
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
    
    return NextResponse.json(restaurantWithMenu);
  } catch (error) {
    console.error('Помилка при отриманні меню:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}