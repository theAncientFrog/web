// app/api/loyalty/subcategories/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/lib/levelingService';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Неавторизовано' }, { status: 401 });
        }

        const userId = Number(session.user.id);
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get('restaurantId');

        if (!restaurantId) {
            return NextResponse.json({ message: 'Не вказано restaurantId' }, { status: 400 });
        }

        const numericRestaurantId = Number(restaurantId);
        if (isNaN(numericRestaurantId)) {
            return NextResponse.json({ message: 'Некоректний restaurantId' }, { status: 400 });
        }

        // Отримуємо всі підкатегорії ресторану з статистикою користувача
        const subcategories = await prisma.category.findMany({
            where: {
                restaurantId: numericRestaurantId,
                parentId: { not: null } // Тільки підкатегорії
            },
            select: {
                id: true,
                name: true,
                nameEn: true,
                parentId: true,
                parent: {
                    select: {
                        id: true,
                        name: true,
                        nameEn: true
                    }
                }
            }
        });

        // Отримуємо статистику користувача для цих підкатегорій
        const subcategoryIds = subcategories.map(cat => cat.id);
        const userStats = await prisma.userSubcategoryStats.findMany({
            where: {
                userId: userId,
                subcategoryId: { in: subcategoryIds }
            }
        });

        // Створюємо map для швидкого доступу до статистики
        const statsMap = new Map();
        userStats.forEach(stat => {
            statsMap.set(stat.subcategoryId, stat.xp);
        });

        // Формуємо результат з рівнями та знижками
        const result = subcategories.map(subcategory => {
            const xp = statsMap.get(subcategory.id) || 0;
            const levelData = calculateLevel(xp);

            // Знижка = рівень підкатегорії × 2% (максимум 20%)
            const discountPercent = Math.min(levelData.level * 2, 20);

            return {
                id: subcategory.id,
                name: subcategory.name,
                nameEn: subcategory.nameEn,
                parentName: subcategory.parent?.name,
                parentNameEn: subcategory.parent?.nameEn,
                level: levelData.level,
                xp: xp,
                progress: levelData.progress,
                xpForNextLevel: levelData.xpForNextLevel,
                discountPercent: discountPercent
            };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('[Subcategory Loyalty API] Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
