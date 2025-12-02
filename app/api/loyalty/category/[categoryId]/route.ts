// app/api/loyalty/category/[categoryId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { calculateLevel } from '@/lib/levelingService';

export async function GET(
    request: Request,
    { params }: { params: { categoryId: string } }
) {
    try {
        // 1. АВТЕНТИФІКАЦІЯ
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            // Якщо користувач не залогінений, просто повертаємо 1 рівень
            return NextResponse.json(calculateLevel(0));
        }
        const userId = Number(session.user.id);
        const categoryId = Number(params.categoryId);

        if (isNaN(categoryId)) {
            return NextResponse.json({ message: 'Некоректний ID категорії' }, { status: 400 });
        }

        // 2. ПОШУК СТАТИСТИКИ
        const stats = await prisma.userCategoryStats.findUnique({
            where: {
                userId_categoryId: {
                    userId: userId,
                    categoryId: categoryId,
                },
            },
        });

        // 3. РОЗРАХУНОК
        const xp = stats ? stats.xp : 0;
        const levelData = calculateLevel(xp);

        return NextResponse.json(levelData);

    } catch (error) {
        console.error("Помилка при отриманні даних лояльності категорії:", error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}



