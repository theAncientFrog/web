// app/api/recent-restaurants/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json([]); 
        }
        
        const userId = session.user.id as number;
        
        // 1. Отримуємо останні записи замовлень
        const recentOrders = await prisma.order.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            select: { restaurantId: true, createdAt: true },
            take: 10,
        });

        // 2. Фільтруємо унікальні ID ресторанів
        const uniqueRestaurantIds: number[] = [];
        const seenIds = new Set();

        for (const order of recentOrders) {
            if (!seenIds.has(order.restaurantId)) {
                uniqueRestaurantIds.push(order.restaurantId);
                seenIds.add(order.restaurantId);
            }
            if (uniqueRestaurantIds.length >= 5) break; 
        }
        
        if (uniqueRestaurantIds.length === 0) {
            return NextResponse.json([]);
        }

        // 3. Отримуємо деталі про ці ресторани
        const recentRestaurants = await prisma.restaurant.findMany({
            where: { id: { in: uniqueRestaurantIds } },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                bannerUrl: true, 
                address: true,
                description: true,
                stars: true,
            }
        });
        
        // 4. Форматуємо фінальний результат
        const finalResult = uniqueRestaurantIds.map(id => {
            const restaurant = recentRestaurants.find(r => r.id === id);
            if (!restaurant) return null;

            const lastOrder = recentOrders.find(o => o.restaurantId === id);

            return {
                ...restaurant,
                lastVisited: lastOrder?.createdAt.toISOString(),
            };
        }).filter(r => r !== null);


        return NextResponse.json(finalResult, {
             headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
    } catch (error) {
        console.error('API Error /recent-restaurants:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}