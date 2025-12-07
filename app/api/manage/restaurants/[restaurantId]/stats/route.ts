// app/api/manage/restaurants/[restaurantId]/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
// 💡 1. ВИПРАВЛЕНО ІМПОРТ: Переконайтеся, що шлях до auth.config.ts правильний
import { authOptions } from '@/lib/auth.config';

// Вказуємо Next.js, що цей роут завжди динамічний (для Vercel)
export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: { restaurantId: string } }
) {
    const session = await getServerSession(authOptions);
    const { restaurantId } = params;

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 💡 2. ВИПРАВЛЕНО ТИП: Конвертуємо string на number
    const idAsNumber = parseInt(restaurantId);

    // Перевіряємо, чи це взагалі число
    if (isNaN(idAsNumber)) {
        return NextResponse.json({ error: 'Invalid restaurant ID' }, { status: 400 });
    }

    // (Опціонально, але гарна практика) Перевірка, чи юзер є власником
    // @ts-ignore (може знадобитися, якщо у session.user немає id)
    const restaurant = await prisma.restaurant.findFirst({
        where: {
            id: idAsNumber,
            // @ts-ignore
            ownerId: session.user.id
        },
    });

    if (!restaurant) {
        return NextResponse.json({ error: 'Forbidden or Not Found' }, { status: 403 });
    }

    try {
        const [stats, totalOrders, topDishesRaw] = await prisma.$transaction([

            // Запит A: Дохід і кількість ЗАВЕРШЕНИХ замовлень
            prisma.order.aggregate({
                _sum: {
                    totalPrice: true,
                },
                _count: {
                    id: true,
                },
                where: {
                    restaurantId: idAsNumber, // ⬅️ Використовуємо число
                    status: 'COMPLETED',
                },
            }),

            // Запит B: Кількість ВСІХ замовлень
            prisma.order.count({
                where: {
                    restaurantId: idAsNumber, // ⬅️ Використовуємо число
                },
            }),

            // Запит C: Топ страви
            prisma.orderItem.groupBy({
                by: ['dishId'],
                where: {
                    order: {
                        restaurantId: idAsNumber, // ⬅️ Використовуємо число
                        status: 'COMPLETED',
                    },
                },
                _sum: {
                    quantity: true,
                },
                orderBy: {
                    _sum: {
                        quantity: 'desc',
                    },
                },
                take: 5,
            }),
        ]);

        // Обробка Топ страв (як і раніше)
        const topDishIds = topDishesRaw.map((item) => item.dishId);

        const dishes = await prisma.dish.findMany({
            where: {
                id: { in: topDishIds },
            },
            select: {
                id: true,
                name: true,
            },
        });

        // З'єднуємо ID, назви та кількість
        const topDishes = topDishesRaw.map((rawItem) => {
            const dish = dishes.find((d) => d.id === rawItem.dishId);
            return {
                dishId: rawItem.dishId,
                name: dish ? dish.name : 'Unknown Dish',
                // 💡 3. БЕЗПЕЧНИЙ ДОСТУП:
                quantitySold: rawItem._sum?.quantity ?? 0,
            };
        });

        // Формуємо остаточну відповідь
        const result = {
            // 💡 3. БЕЗПЕЧНИЙ ДОСТУП:
            totalRevenue: stats._sum?.totalPrice ?? 0,
            completedOrders: stats._count?.id ?? 0,
            totalOrdersAllTime: totalOrders ?? 0,
            topDishes: topDishes,
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}