import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json({ message: 'Email та код є обов\'язковими' }, { status: 400 });
        }

        // 1. Пошук коду в базі
        const verificationCode = await prisma.emailVerificationCode.findFirst({
            where: {
                email: email.toLowerCase(),
                code: code,
            },
        });

        if (!verificationCode) {
            return NextResponse.json({ message: 'Невірний email або код верифікації' }, { status: 400 });
        }

        // 2. Перевірка терміну дії
        if (new Date() > verificationCode.expiresAt) {
            // Видаляємо прострочений код
            await prisma.emailVerificationCode.delete({ where: { id: verificationCode.id } });
            return NextResponse.json({ message: 'Термін дії коду вийшов. Спробуйте ще раз.' }, { status: 400 });
        }

        // 3. Успіх! Оновлюємо користувача
        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: {
                emailVerified: new Date(), // Встановлюємо дату верифікації
            },
        });

        // 4. Видаляємо використаний код
        await prisma.emailVerificationCode.delete({ where: { id: verificationCode.id } });

        return NextResponse.json({ message: 'Пошту успішно верифіковано!' }, { status: 200 });

    } catch (error) {
        console.error('Помилка верифікації email:', error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}
