// app/api/orders/my/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';

// Вказуємо Next.js, що цей роут завжди динамічний (для Vercel)
export const dynamic = 'force-dynamic';

// ▼▼▼ ВИПРАВЛЕННЯ: Явно визначаємо типи, які повертає Prisma ▼▼▼

// Тип для елемента 'items', який повертає select
type ItemFromDB = {
    quantity: number;
    priceAtPurchase: number | null;
    dish: { name: string };
};

// Тип для даних, які повертає `prisma.order.findMany`
type OrderFromDB = {
    id: number;
    createdAt: Date;
    totalPrice: number;
    status: string;
    restaurantId: number;
    items: ItemFromDB[];
};

// ▲▲▲ ▲▲▲ ▲▲▲


export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Неавторизовано' }, { status: 401 });
        }
        
        const userIdRaw = session.user.id;
        const numericUserId = typeof userIdRaw === 'string' ? parseInt(userIdRaw) : (userIdRaw as number); 
        
        if (isNaN(numericUserId) || !numericUserId) {
             return NextResponse.json({ message: 'Помилка ID користувача' }, { status: 400 });
        }

        // 1. Отримуємо замовлення
        const orders: OrderFromDB[] = await prisma.order.findMany({
            where: { userId: numericUserId },
            orderBy: { createdAt: 'desc' },
            select: { 
                id: true,
                createdAt: true,
                totalPrice: true,
                status: true,
                restaurantId: true,
                items: {
                    select: {
                        quantity: true,
                        priceAtPurchase: true,
                        dish: { select: { name: true } } 
                    }
                }
            }
        });
        
        // 2. Форматуємо дані для фронтенду
        // ▼▼▼ ВИПРАВЛЕННЯ: Додано явні типи для 'order' та 'item' ▼▼▼
        const ordersWithDetails = orders.map((order: OrderFromDB) => ({
            ...order,
            items: order.items.map((item: ItemFromDB) => ({
                name: item.dish.name,
                quantity: item.quantity,
                price: item.priceAtPurchase ?? 0 // Обробляємо null значення
            })),
        }));
        // ▲▲▲ ▲▲▲ ▲▲▲

        return NextResponse.json(ordersWithDetails, {
             headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
        
    } catch (error) {
        console.error('Error fetching my orders (500):', error);
        return NextResponse.json({ message: 'Помилка сервера' }, { status: 500 });
    }
}