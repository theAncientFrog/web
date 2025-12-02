// app/api/loyalty/[restaurantId]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { calculateLevel } from '@/lib/levelingService';

export async function GET(
    request: Request,
    { params }: { params: { restaurantId: string } }
) {
    try {
        // 1. АВТЕНТИФІКАЦІЯ
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            // Якщо користувач не залогінений, просто повертаємо 1 рівень
            return NextResponse.json(calculateLevel(0));
        }
        const userId = Number(session.user.id);
        const restaurantId = Number(params.restaurantId);

        if (isNaN(restaurantId)) {
            return NextResponse.json({ message: 'Некоректний ID ресторану' }, { status: 400 });
        }

        // 2. ПОШУК СТАТИСТИКИ
        const stats = await prisma.userRestaurantStats.findUnique({
            where: {
                userId_restaurantId: {
                    userId: userId,
                    restaurantId: restaurantId,
                },
            },
        });

        // 3. РОЗРАХУНОК
        const xp = stats ? stats.xp : 0;
        const levelData = calculateLevel(xp);

        return NextResponse.json(levelData);

    } catch (error) {
        console.error("Помилка при отриманні даних лояльності:", error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}