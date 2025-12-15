import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - отримати тільки номери столиків ресторану (публічний доступ)
export async function GET(
    request: Request,
    context: { params: { restaurantId: string } }
) {
    try {
        const { restaurantId } = context.params;
        const numericRestaurantId = parseInt(restaurantId);

        if (isNaN(numericRestaurantId)) {
            return NextResponse.json({ message: 'Некоректний ID ресторану' }, { status: 400 });
        }

        // Отримуємо тільки номери столиків (публічний доступ)
        // @ts-ignore
        const tables = await prisma.table.findMany({
            where: { restaurantId: numericRestaurantId },
            select: {
                number: true,
                status: true
            },
            orderBy: { number: 'asc' }
        });

        return NextResponse.json(tables);
    } catch (error) {
        console.error('Помилка при отриманні столиків:', error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}









