// app/api/restaurants/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocaleFromRequest, localizeEntity } from '@/lib/i18n-helpers';

// Вказуємо Next.js, що цей роут завжди динамічний (для Vercel)
export const dynamic = 'force-dynamic';

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

        // Визначаємо локаль з запиту
        const locale = getLocaleFromRequest(request);

        // Цей запит спрацює, коли сервер запуститься
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: numericId },
            select: { 
                id: true,
                name: true,
                nameEn: true,
                description: true,
                descriptionEn: true,
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

        // Локалізуємо дані ресторану
        const localizedRestaurant = localizeEntity(restaurant, locale);

        return NextResponse.json(localizedRestaurant, {
            headers: {
                'Content-Language': locale,
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                'Vary': 'Accept-Language, x-lang',
            }
        });

    } catch (error) {
        console.error('Помилка API /api/restaurants/[id]:', error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}