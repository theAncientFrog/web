// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Перевіряємо з'єднання з базою даних
        await prisma.$queryRaw`SELECT 1`;

        // Перевіряємо кількість ресторанів
        const restaurantCount = await prisma.restaurant.count();

        return NextResponse.json({
            status: 'healthy',
            database: 'connected',
            restaurants: restaurantCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json(
            {
                status: 'unhealthy',
                database: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
