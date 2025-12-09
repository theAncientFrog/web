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
        const { reservedAt, customerName, customerPhone, notes } = body;

        if (!reservedAt) {
            return NextResponse.json({ message: 'Час бронювання обов\'язковий' }, { status: 400 });
        }

        const reservedDateTime = new Date(reservedAt);
        const startOfDay = new Date(reservedDateTime);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(reservedDateTime);
        endOfDay.setHours(23, 59, 59, 999);

        // Знаходимо вільний столик для обраної дати та часу
        // @ts-ignore
        const allTables = await prisma.table.findMany({
            where: {
                restaurantId: numericRestaurantId,
                status: 'FREE'
            }
        });

        if (allTables.length === 0) {
            return NextResponse.json({ message: 'Вільних столиків немає' }, { status: 409 });
        }

        // Перевіряємо, які столики вже заброньовані на цей час
        // @ts-ignore
        const existingReservations = await prisma.reservation.findMany({
            where: {
                restaurantId: numericRestaurantId,
                reservedAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            select: {
                tableId: true,
                reservedAt: true
            }
        });

        // Знаходимо столики, які вільні на обраний час
        // Бронювання триває 1.5 години, тому перевіряємо перекриття в межах 1.5 години до і після
        const reservationDuration = 1.5 * 60 * 60 * 1000; // 1.5 години в мілісекундах
        const reservedTableIds = new Set(
            existingReservations
                .filter(res => {
                    const resTime = new Date(res.reservedAt);
                    const timeDiff = Math.abs(resTime.getTime() - reservedDateTime.getTime());
                    // Перевіряємо, чи бронювання перекривається (в межах 1.5 години до або після)
                    return timeDiff < reservationDuration;
                })
                .map(res => res.tableId)
        );

        const availableTables = allTables.filter(table => !reservedTableIds.has(table.id));

        if (availableTables.length === 0) {
            return NextResponse.json({ message: 'На обраний час немає вільних столиків' }, { status: 409 });
        }

        // Вибираємо випадковий вільний столик
        const selectedTable = availableTables[Math.floor(Math.random() * availableTables.length)];

        // Створення бронювання
        const userId = Number(session.user.id);
        // @ts-ignore
        const reservation = await prisma.reservation.create({
            data: {
                tableId: selectedTable.id,
                restaurantId: numericRestaurantId,
                userId: userId,
                reservedAt: reservedDateTime,
                customerName: customerName || null,
                customerPhone: customerPhone || null,
                notes: notes || null
            },
            include: {
                table: {
                    select: { number: true }
                }
            }
        });

        const assignedTableNumber = reservation.table?.number || selectedTable.number;

        // Оновлюємо статус столика на RESERVED
        // @ts-ignore
        await prisma.table.update({
            where: { id: selectedTable.id },
            data: { status: 'RESERVED' }
        });

        return NextResponse.json({
            ...reservation,
            assignedTable: assignedTableNumber
        }, { status: 201 });
    } catch (error: any) {
        console.error('Помилка при створенні бронювання:', error);
        
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Бронювання з такими параметрами вже існує' }, { status: 409 });
        }

        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}


