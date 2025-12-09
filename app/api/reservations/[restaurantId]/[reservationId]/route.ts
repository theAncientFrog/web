import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// DELETE - скасувати бронювання
export async function DELETE(
    request: Request,
    context: { params: { restaurantId: string; reservationId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Неавторизовано' }, { status: 401 });
        }

        const { restaurantId, reservationId } = context.params;
        const numericRestaurantId = parseInt(restaurantId);
        const numericReservationId = parseInt(reservationId);

        if (isNaN(numericRestaurantId) || isNaN(numericReservationId)) {
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

        // Перевірка, чи бронювання належить ресторану
        // @ts-ignore
        const reservation = await prisma.reservation.findUnique({
            where: { id: numericReservationId },
            select: { restaurantId: true, tableId: true, userId: true }
        });

        if (!reservation) {
            return NextResponse.json({ message: 'Бронювання не знайдено' }, { status: 404 });
        }

        if (reservation.restaurantId !== numericRestaurantId) {
            return NextResponse.json({ message: 'Бронювання не належить цьому ресторану' }, { status: 403 });
        }

        // Перевірка, чи користувач є власником ресторану або власником бронювання
        const userId = Number(session.user.id);
        const isOwner = restaurant.ownerId === userId;
        const isReservationOwner = reservation.userId === userId;

        if (!isOwner && !isReservationOwner) {
            return NextResponse.json({ message: 'Доступ заборонено' }, { status: 403 });
        }

        // Видаляємо бронювання
        // @ts-ignore
        await prisma.reservation.delete({
            where: { id: numericReservationId }
        });

        // Оновлюємо статус столика на FREE
        // @ts-ignore
        await prisma.table.update({
            where: { id: reservation.tableId },
            data: { status: 'FREE' }
        });

        return NextResponse.json({ message: 'Бронювання успішно скасовано' });
    } catch (error) {
        console.error('Помилка при скасуванні бронювання:', error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}


