// Тестовий endpoint для перевірки ачівок
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { checkAndAwardAchievements } from '@/lib/achievementService';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Неавторизовано' }, { status: 401 });
        }

        const userId = Number(session.user.id);

        // Перевіряємо, чи є ачівки в базі
        const allAchievements = await prisma.achievement.findMany();
        
        // Перевіряємо замовлення користувача
        const userOrders = await prisma.order.findMany({
            where: {
                userId: userId,
                status: 'COMPLETED'
            }
        });

        // Перевіряємо наявні ачівки користувача
        const userAchievements = await prisma.userAchievement.findMany({
            where: { userId: userId },
            include: { achievement: true }
        });

        // Запускаємо перевірку ачівок
        await checkAndAwardAchievements(userId);

        // Отримуємо оновлені ачівки після перевірки
        const updatedUserAchievements = await prisma.userAchievement.findMany({
            where: { userId: userId },
            include: { achievement: true }
        });

        return NextResponse.json({
            success: true,
            debug: {
                userId,
                totalAchievementsInDB: allAchievements.length,
                achievementsInDB: allAchievements.map(a => ({ code: a.code, name: a.name })),
                userCompletedOrders: userOrders.length,
                userOrders: userOrders.map(o => ({ id: o.id, restaurantId: o.restaurantId, status: o.status })),
                userAchievementsBefore: userAchievements.map(ua => ua.achievement.code),
                userAchievementsAfter: updatedUserAchievements.map(ua => ua.achievement.code),
                newAchievementsAwarded: updatedUserAchievements.length - userAchievements.length
            }
        });
    } catch (error: any) {
        console.error('[Test Achievements] Помилка:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
}

