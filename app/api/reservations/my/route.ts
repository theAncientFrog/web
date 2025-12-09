import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - отримати всі бронювання поточного користувача
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Неавторизовано' }, { status: 401 });
        }

        const userId = Number(session.user.id);

        // @ts-ignore
        const reservations = await prisma.reservation.findMany({
            where: { userId: userId },
            include: {
                table: {
                    select: { number: true, status: true }
                },
                restaurant: {
                    select: { id: true, name: true, logo: true }
                }
            },
            orderBy: { reservedAt: 'asc' }
        });

        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Помилка при отриманні бронювань користувача:', error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}

