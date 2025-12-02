// app/api/profile/summary/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Не авторизовано' }, { status: 401 });
    }
    const userId = Number(session.user.id);
    if (isNaN(userId)) {
        return NextResponse.json({ message: 'Некоректний ID користувача' }, { status: 400 });
    }

    try {
        const [achievementsCount, uniqueRestaurants, totalOrdersCount] = await prisma.$transaction([

            // Запит 1: Рахуємо ачівки
            prisma.userAchievement.count({
                where: { userId: userId }
            }),

            // Запит 2: Рахуємо унікальні візити (отримуємо унікальні restaurantId)
            prisma.order.findMany({
                where: {
                    userId: userId,
                    status: 'COMPLETED'
                },
                select: {
                    restaurantId: true
                },
                distinct: ['restaurantId']
            }),

            // Запит 3: Загальна кількість замовлень
            prisma.order.count({
                where: { userId: userId }
            })
        ]);

        const visitedCount = uniqueRestaurants.length;

        return NextResponse.json({
            achievementsCount: achievementsCount,
            visitedCount: visitedCount,
            totalOrdersCount: totalOrdersCount
        });

    } catch (error) {
        console.error("Помилка при отриманні статистики профілю:", error);
        return NextResponse.json({ message: 'Внутрішня помишка сервера' }, { status: 500 });
    }
}