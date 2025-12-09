import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

// Вказуємо Next.js, що цей роут завжди динамічний (для Vercel)
export const dynamic = 'force-dynamic';

// DELETE - видалити столик
export async function DELETE(
    request: Request,
    context: { params: { restaurantId: string; tableId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Неавторизовано' }, { status: 401 });
        }

        const { restaurantId, tableId } = context.params;
        const numericRestaurantId = parseInt(restaurantId);
        const numericTableId = parseInt(tableId);

        if (isNaN(numericRestaurantId) || isNaN(numericTableId)) {
            return NextResponse.json({ message: 'Некоректний ID' }, { status: 400 });
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

        // Перевірка, чи столик належить ресторану
        // @ts-ignore - Table модель додано в схему Prisma, TypeScript може не бачити оновлений тип
        const table = await prisma.table.findUnique({
            where: { id: numericTableId },
            select: { restaurantId: true }
        });

        if (!table) {
            return NextResponse.json({ message: 'Столик не знайдено' }, { status: 404 });
        }

        if (table.restaurantId !== numericRestaurantId) {
            return NextResponse.json({ message: 'Столик не належить цьому ресторану' }, { status: 403 });
        }

        // Повне видалення столика з БД (включаючи всі пов'язані записи через onDelete: Cascade)
        // @ts-ignore - Table модель додано в схему Prisma, TypeScript може не бачити оновлений тип
        await prisma.table.delete({
            where: { id: numericTableId }
        });

        return NextResponse.json({ message: 'Столик успішно видалено' });
    } catch (error) {
        console.error('Помилка при видаленні столика:', error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}

// PUT - оновити столик (наприклад, змінити номер)
export async function PUT(
    request: Request,
    context: { params: { restaurantId: string; tableId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Неавторизовано' }, { status: 401 });
        }

        const { restaurantId, tableId } = context.params;
        const numericRestaurantId = parseInt(restaurantId);
        const numericTableId = parseInt(tableId);

        if (isNaN(numericRestaurantId) || isNaN(numericTableId)) {
            return NextResponse.json({ message: 'Некоректний ID' }, { status: 400 });
        }

        const body = await request.json();
        const { number, status } = body;

        // Якщо передано тільки status (без number), оновлюємо тільки статус
        if (status !== undefined && (!number || number === '')) {
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

            // Перевірка, чи столик належить ресторану
            // @ts-ignore
            const table = await prisma.table.findUnique({
                where: { id: numericTableId },
                select: { restaurantId: true }
            });

            if (!table) {
                return NextResponse.json({ message: 'Столик не знайдено' }, { status: 404 });
            }

            if (table.restaurantId !== numericRestaurantId) {
                return NextResponse.json({ message: 'Столик не належить цьому ресторану' }, { status: 403 });
            }

            // Оновлюємо тільки статус
            // @ts-ignore
            const updatedTable = await prisma.table.update({
                where: { id: numericTableId },
                data: { status }
            });
            return NextResponse.json(updatedTable);
        }

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

        // Перевірка, чи столик належить ресторану (для PUT запиту)
        // @ts-ignore - Table модель додано в схему Prisma, TypeScript може не бачити оновлений тип
        const table = await prisma.table.findUnique({
            where: { id: numericTableId },
            select: { restaurantId: true, number: true }
        });

        if (!table) {
            return NextResponse.json({ message: 'Столик не знайдено' }, { status: 404 });
        }

        if (table.restaurantId !== numericRestaurantId) {
            return NextResponse.json({ message: 'Столик не належить цьому ресторану' }, { status: 403 });
        }

        // Перевірка, чи столик з таким номером вже існує (якщо номер змінюється)
        if (table.number !== number.trim()) {
            // @ts-ignore
            const existingTable = await prisma.table.findFirst({
                where: {
                    restaurantId: numericRestaurantId,
                    number: number.trim(),
                    id: { not: numericTableId } // Виключаємо поточний столик
                }
            });

            if (existingTable) {
                return NextResponse.json({ message: 'Столик з таким номером вже існує' }, { status: 409 });
            }
        }

        // Генерація нового QR коду
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const qrCodeUrl = `${baseUrl}/menu-secondary/${numericRestaurantId}?table=${encodeURIComponent(number.trim())}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);

        // @ts-ignore - Table модель додано в схему Prisma, TypeScript може не бачити оновлений тип
        const updatedTable = await prisma.table.update({
            where: { id: numericTableId },
            data: {
                number: number.trim(),
                qrCodeUrl: qrCodeDataUrl,
                status: status || undefined
            }
        });

        return NextResponse.json(updatedTable);
    } catch (error: any) {
        console.error('Помилка при оновленні столика:', error);
        
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Столик з таким номером вже існує' }, { status: 409 });
        }

        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}

