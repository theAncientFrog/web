// app/api/partners/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Отримуємо лише основні дані, які потрібні для картки-прев'ю
        const restaurants = await prisma.restaurant.findMany({
            // ⬅️ Вибираємо лише основні, стабільні поля
            select: {
                id: true,
                name: true,
                description: true,
                address: true, 
                logoUrl: true, 
                bannerUrl: true, 
            },
            orderBy: {
                name: 'asc',
            }
        });

        // Встановлюємо заголовок для запобігання кешуванню
        return NextResponse.json(restaurants, {
             headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
    } catch (error) {
        console.error('API Error /partners (500):', error);
        // ⬅️ Повертаємо 500, щоб фронтенд міг показати помилку
        return NextResponse.json(
            { message: 'Internal Server Error during restaurant fetching.' },
            { status: 500 }
        );
    }
}