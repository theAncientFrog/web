// app/api/profile/update/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Неавторизовано' },
                { status: 401 }
            );
        }

        const userId = Number(session.user.id);
        const { name, email } = await request.json();

        // Валідація
        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { message: 'Ім\'я не може бути порожнім' },
                { status: 400 }
            );
        }

        // Перевірка, чи email не зайнятий іншим користувачем (якщо змінюється)
        if (email && email !== session.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });

            if (existingUser && existingUser.id !== userId) {
                return NextResponse.json(
                    { message: 'Email вже використовується іншим користувачем' },
                    { status: 409 }
                );
            }
        }

        // Оновлення профілю
        const updateData: { name: string; email?: string } = {
            name: name.trim(),
        };

        if (email && email !== session.user.email) {
            updateData.email = email.toLowerCase();
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
            },
        });

        return NextResponse.json(
            { message: 'Профіль успішно оновлено', user: updatedUser },
            { status: 200 }
        );

    } catch (error) {
        console.error('Помилка оновлення профілю:', error);
        return NextResponse.json(
            { message: 'Внутрішня помилка сервера' },
            { status: 500 }
        );
    }
}



