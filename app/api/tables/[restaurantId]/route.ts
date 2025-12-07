import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

// Вказуємо Next.js, що цей роут завжди динамічний (для Vercel)
export const dynamic = 'force-dynamic';

// GET - отримати всі столики ресторану
export async function GET(
    request: Request,
    context: { params: { restaurantId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Неавторизовано' }, { status: 401 });
        }

        const { restaurantId } = context.params;
        const numericRestaurantId = parseInt(restaurantId);

        if (isNaN(numericRestaurantId)) {
            return NextResponse.json({ message: 'Некоректний ID ресторану' }, { status: 400 });
        }

        // Перевірка, чи користувач є власником ресторану
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: numericRestaurantId },
            select: { ownerId: true }
        });

        if (!restaurant) {
            return NextResponse.json({ message: 'Ресторан не знайдено' }, { status: 404 });
        }

        if (restaurant.ownerId !== Number(session.user.id)) {
            return NextResponse.json({ message: 'Доступ заборонено' }, { status: 403 });
        }

        // @ts-ignore - Table модель додано в схему Prisma, TypeScript може не бачити оновлений тип
        const tables = await prisma.table.findMany({
            where: { restaurantId: numericRestaurantId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(tables);
    } catch (error) {
        console.error('Помилка при отриманні столиків:', error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}

// POST - створити новий столик
export async function POST(
    request: Request,
    context: { params: { restaurantId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Неавторизовано' }, { status: 401 });
        }

        const { restaurantId } = context.params;
        const numericRestaurantId = parseInt(restaurantId);

        if (isNaN(numericRestaurantId)) {
            return NextResponse.json({ message: 'Некоректний ID ресторану' }, { status: 400 });
        }

        const { number } = await request.json();

        if (!number || typeof number !== 'string' || number.trim() === '') {
            return NextResponse.json({ message: 'Номер столика обов\'язковий' }, { status: 400 });
        }

        // Перевірка, чи користувач є власником ресторану
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: numericRestaurantId },
            select: { ownerId: true }
        });

        if (!restaurant) {
            return NextResponse.json({ message: 'Ресторан не знайдено' }, { status: 404 });
        }

        if (restaurant.ownerId !== Number(session.user.id)) {
            return NextResponse.json({ message: 'Доступ заборонено' }, { status: 403 });
        }

        // Генерація URL для QR коду
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const qrCodeUrl = `${baseUrl}/menu-secondary/${numericRestaurantId}?table=${encodeURIComponent(number.trim())}`;

        // Генерація QR коду як base64
        let qrCodeDataUrl: string;
        try {
            qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);
        } catch (qrError) {
            console.error('Помилка генерації QR коду:', qrError);
            return NextResponse.json({ message: 'Помилка генерації QR коду' }, { status: 500 });
        }

        // Створення столика
        // @ts-ignore - Table модель додано в схему Prisma, TypeScript може не бачити оновлений тип
        const table = await prisma.table.create({
            data: {
                number: number.trim(),
                restaurantId: numericRestaurantId,
                qrCodeUrl: qrCodeDataUrl
            }
        });

        return NextResponse.json(table, { status: 201 });
    } catch (error: any) {
        console.error('Помилка при створенні столика:', error);
        
        // Перевірка на унікальність
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Столик з таким номером вже існує' }, { status: 409 });
        }

        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}

