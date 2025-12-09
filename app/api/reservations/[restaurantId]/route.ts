import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - отримати всі бронювання ресторану
export async function GET(
    request: Request,
    context: { params: { restaurantId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const { restaurantId } = context.params;
        const numericRestaurantId = parseInt(restaurantId);

        if (isNaN(numericRestaurantId)) {
            return NextResponse.json({ message: 'Некоректний ID ресторану' }, { status: 400 });
        }

        // Якщо користувач залогінений і є власником - показуємо всі бронювання
        // Якщо не залогінений або не власник - показуємо тільки вільні столики
        if (session?.user?.id) {
            const restaurant = await prisma.restaurant.findUnique({
                where: { id: numericRestaurantId },
                select: { ownerId: true }
            });

            if (restaurant && restaurant.ownerId === Number(session.user.id)) {
                // Власник бачить всі бронювання
                const reservations = await prisma.reservation.findMany({
                    where: { restaurantId: numericRestaurantId },
                    include: {
                        table: {
                            select: { number: true, status: true }
                        }
                    },
                    orderBy: { reservedAt: 'asc' }
                });
                return NextResponse.json(reservations);
            }
        }

        // Для всіх інших - показуємо тільки вільні столики
        const freeTables = await prisma.table.findMany({
            where: {
                restaurantId: numericRestaurantId,
                status: 'FREE'
            },
            select: {
                id: true,
                number: true,
                status: true
            },
            orderBy: { number: 'asc' }
        });

        return NextResponse.json(freeTables);
    } catch (error) {
        console.error('Помилка при отриманні бронювань:', error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}

// POST - створити нове бронювання
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

        const body = await request.json();
        const { tableId, reservedAt, customerName, customerPhone, notes } = body;

        if (!tableId || !reservedAt) {
            return NextResponse.json({ message: 'ID столика та час бронювання обов\'язкові' }, { status: 400 });
        }

        // Перевірка, чи столик існує та належить ресторану
        // @ts-ignore
        const table = await prisma.table.findUnique({
            where: { id: parseInt(tableId) },
            select: { restaurantId: true, status: true }
        });

        if (!table) {
            return NextResponse.json({ message: 'Столик не знайдено' }, { status: 404 });
        }

        if (table.restaurantId !== numericRestaurantId) {
            return NextResponse.json({ message: 'Столик не належить цьому ресторану' }, { status: 403 });
        }

        // Перевірка, чи столик вільний
        if (table.status !== 'FREE') {
            return NextResponse.json({ message: 'Столик зайнятий або вже заброньований' }, { status: 409 });
        }

        // Створення бронювання
        const userId = Number(session.user.id);
        // @ts-ignore
        const reservation = await prisma.reservation.create({
            data: {
                tableId: parseInt(tableId),
                restaurantId: numericRestaurantId,
                userId: userId,
                reservedAt: new Date(reservedAt),
                customerName: customerName || null,
                customerPhone: customerPhone || null,
                notes: notes || null
            }
        });

        // Оновлюємо статус столика на RESERVED
        // @ts-ignore
        await prisma.table.update({
            where: { id: parseInt(tableId) },
            data: { status: 'RESERVED' }
        });

        return NextResponse.json(reservation, { status: 201 });
    } catch (error: any) {
        console.error('Помилка при створенні бронювання:', error);
        
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Бронювання з такими параметрами вже існує' }, { status: 409 });
        }

        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}


