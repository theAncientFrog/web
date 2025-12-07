// app/api/loyalty/categories/[restaurantId]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { calculateLevel } from '@/lib/levelingService';

// Вказуємо Next.js, що цей роут завжди динамічний (для Vercel)
export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { restaurantId: string } }
) {
    try {
        // 1. АВТЕНТИФІКАЦІЯ
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({}, { status: 200 });
        }
        const userId = Number(session.user.id);
        const restaurantId = Number(params.restaurantId);

        if (isNaN(restaurantId)) {
            return NextResponse.json({ message: 'Некоректний ID ресторану' }, { status: 400 });
        }

        // 2. ОТРИМУЄМО ВСІ ГОЛОВНІ КАТЕГОРІЇ РЕСТОРАНУ
        const mainCategories = await prisma.category.findMany({
            where: {
                restaurantId: restaurantId,
                parentId: null, // Тільки головні категорії
            },
        });

        // 3. ОТРИМУЄМО СТАТИСТИКУ ДЛЯ КОЖНОЇ КАТЕГОРІЇ
        // Повертаємо дані для всіх категорій, навіть якщо немає статистики
        const categoriesWithLevels = await Promise.all(
            mainCategories.map(async (category) => {
                const stats = await prisma.userCategoryStats.findUnique({
                    where: {
                        userId_categoryId: {
                            userId: userId,
                            categoryId: category.id,
                        },
                    },
                });

                const xp = stats ? stats.xp : 0;
                const levelData = calculateLevel(xp);

                return {
                    categoryId: category.id,
                    categoryName: category.name,
                    hasStats: stats !== null, // Чи є статистика (чи робив покупки)
                    ...levelData,
                };
            })
        );

        return NextResponse.json(categoriesWithLevels, { status: 200 });

    } catch (error) {
        console.error("Помилка при отриманні даних лояльності категорій:", error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}

