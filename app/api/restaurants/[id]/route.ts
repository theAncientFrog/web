// app/api/restaurants/[id]/route.ts
import { NextResponse } from 'next/server';
// 💡 Використовуємо псевдонім '@', який вказує на 'app'
import prisma from '@/lib/prisma'; 

type RouteParams = {
    params: {
        id: string; 
    }
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = params;
        const numericId = Number(id);

        if (isNaN(numericId)) {
            return NextResponse.json({ message: 'Некоректний формат ID' }, { status: 400 });
        }

        // Цей запит спрацює, коли сервер запуститься
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: numericId },
            select: { 
                id: true,
                name: true,
                description: true,
                logoUrl: true,
                bannerUrl: true,   
                address: true,   
                stars: true      
            }
        });

        if (!restaurant) {
            console.warn(`[API] Ресторан з ID: ${numericId} не знайдено в БД!`);
            return NextResponse.json({ message: 'Ресторан не знайдено' }, { status: 404 });
        }

        return NextResponse.json(restaurant);

    } catch (error) {
        console.error('Помилка API /api/restaurants/[id]:', error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}