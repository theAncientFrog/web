// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs'; // Ми використовували bcrypt для реєстрації



export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // 1. Перевірка, чи є email та пароль
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // 2. Пошук користувача в базі даних
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 } // 401 Unauthorized
            );
        }

        // 3. Перевірка паролю
        // Ми порівнюємо звичайний пароль з форми з хешованим паролем з БД
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // 4. Успішний вхід
        // (Тут ви б створили JWT токен або сесію)

        // Прибираємо пароль з відповіді
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            { message: 'Login successful', user: userWithoutPassword },
            { status: 200 }
        );

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}