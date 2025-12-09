// app/api/loyalty/categories/[restaurantId]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { calculateLevel } from '@/lib/levelingService';
import { getLocaleFromRequest, localizeEntity } from '@/lib/i18n-helpers';

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

        // Визначаємо локаль з запиту
        const locale = getLocaleFromRequest(request);
        
        // 2. ОТРИМУЄМО ВСІ ГОЛОВНІ КАТЕГОРІЇ РЕСТОРАНУ
        const mainCategories = await prisma.category.findMany({
            where: {
                restaurantId: restaurantId,
                parentId: null, // Тільки головні категорії
            },
            select: {
                id: true,
                name: true,
                nameEn: true,
            },
        });

        // 3. ОТРИМУЄМО СТАТИСТИКУ ДЛЯ КОЖНОЇ КАТЕГОРІЇ
        // Повертаємо дані для всіх категорій, навіть якщо немає статистики
        const categoriesWithLevels = await Promise.all(
            mainCategories.map(async (category) => {
                let stats = null;
                try {
                    if (prisma.userCategoryStats) {
                        stats = await prisma.userCategoryStats.findUnique({
                            where: {
                                userId_categoryId: {
                                    userId: userId,
                                    categoryId: category.id,
                                },
                            },
                        });
                    }
                } catch (error) {
                    // Якщо модель не існує, просто повертаємо null
                    stats = null;
                }

                const xp = stats ? stats.xp : 0;
                const levelData = calculateLevel(xp);

                // Локалізуємо назву категорії
                const localizedCategory = localizeEntity(category, locale);

                return {
                    categoryId: category.id,
                    categoryName: localizedCategory.name,
                    hasStats: stats !== null, // Чи є статистика (чи робив покупки)
                    ...levelData,
                };
            })
        );

        return NextResponse.json(categoriesWithLevels, {
            status: 200,
            headers: {
                'Content-Language': locale,
                'Vary': 'Accept-Language, x-lang',
            }
        });

    } catch (error) {
        console.error("Помилка при отриманні даних лояльності категорій:", error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}

