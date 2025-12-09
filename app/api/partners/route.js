// app/api/partners/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocaleFromRequest, localizeEntities } from '@/lib/i18n-helpers';

export async function GET(request) {
    try {
        // Визначаємо локаль з запиту (з fallback на 'ua' якщо помилка)
        let locale = 'ua';
        try {
            // Створюємо об'єкт з url та headers для getLocaleFromRequest
            // Next.js Request має url та headers властивості
            const requestWithUrl = {
                url: request.url || request.nextUrl?.href || '',
                headers: request.headers || new Headers(),
            };
            locale = getLocaleFromRequest(requestWithUrl);
        } catch (localeError) {
            console.warn('[Partners API] Failed to get locale from request, using default:', localeError);
        }
        
        console.log('[Partners API] Fetching restaurants with locale:', locale);
        
        // Отримуємо лише основні дані, які потрібні для картки-прев'ю
        const restaurants = await prisma.restaurant.findMany({
            // ⬅️ Вибираємо лише основні, стабільні поля + локалізацію
            select: {
                id: true,
                name: true,
                nameEn: true,
                description: true,
                descriptionEn: true,
                address: true, 
                logoUrl: true, 
                bannerUrl: true, 
            },
            orderBy: {
                name: 'asc',
            }
        });

        console.log('[Partners API] Found restaurants:', restaurants.length);

        // Локалізуємо дані ресторанів (з обробкою помилок)
        let localizedRestaurants;
        try {
            localizedRestaurants = localizeEntities(restaurants, locale);
            console.log('[Partners API] Localized restaurants successfully');
        } catch (localizeError) {
            console.error('[Partners API] Failed to localize restaurants:', localizeError);
            // Якщо локалізація не вдалася, повертаємо оригінальні дані без англійських полів
            localizedRestaurants = restaurants.map(r => ({
                id: r.id,
                name: r.name || '',
                description: r.description || null,
                address: r.address,
                logoUrl: r.logoUrl,
                bannerUrl: r.bannerUrl,
            }));
        }

        // Встановлюємо заголовок для запобігання кешуванню
        return NextResponse.json(localizedRestaurants, {
             headers: { 
                 'Cache-Control': 'no-store, max-age=0',
                 'Content-Language': locale,
                 'Vary': 'Accept-Language, x-lang',
             }
        });
    } catch (error) {
        console.error('API Error /partners (500):', error);
        // ⬅️ Повертаємо 500, щоб фронтенд міг показати помилку
        return NextResponse.json(
            { message: 'Internal Server Error during restaurant fetching.', error: error.message },
            { status: 500 }
        );
    }
}