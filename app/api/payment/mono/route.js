// app/api/payment/mono/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
// Переконайтесь, що у вас є цей файл і він працює
// import prisma from '../../../../lib/prisma';

// URL API Monobank (краще винести в .env, але поки так)
const MONO_API_URL = 'https://api.monobank.ua/api/merchant/invoice/create';

export async function POST(request) {
    const session = await getServerSession(authOptions);

    // Перевірка сесії
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { items, totalAmount } = await request.json();

        if (!items || !totalAmount || totalAmount <= 0 || items.length === 0) {
            return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
        }

        // Створюємо унікальний ID замовлення
        const orderId = `order_${Date.now()}_${session.user.id || 'guest'}`; // Додаємо ID користувача, якщо є

        // Дані для Monobank API
        const monoRequestBody = {
            amount: Math.round(totalAmount * 100), // Сума в копійках
            merchantPaymInfo: {
                reference: orderId,
                destination: 'Оплата замовлення #' + orderId,
                basketOrder: items.map(item => ({
                    name: item.name.substring(0, 30), // Обмежуємо довжину назви
                    qty: item.quantity,
                    sum: Math.round(item.price * item.quantity * 100),
                    // code: item.id.toString(), // Необов'язково
                    // icon: item.imageUrl // Необов'язково
                })),
            },
            // Переконайтесь, що NEXTAUTH_URL є в .env
            redirectUrl: `${process.env.NEXTAUTH_URL}/order/success?orderId=${orderId}`,
            webHookUrl: `${process.env.NEXTAUTH_URL}/api/payment/mono/webhook`,
            // validity: 3600,
        };

        // Перевірка наявності API ключа
        if (!process.env.MONOBANK_API_KEY) {
            console.error('Monobank API Key (X-Token) is not defined in .env');
            throw new Error('Payment provider configuration error.');
        }

        // Відправляємо запит до Monobank
        const monoResponse = await fetch(MONO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': process.env.MONOBANK_API_KEY,
            },
            body: JSON.stringify(monoRequestBody),
        });

        const monoData = await monoResponse.json();

        if (!monoResponse.ok || !monoData.invoiceId || !monoData.pageUrl) {
            console.error('Monobank API error:', monoData);
            throw new Error(monoData.errDescription || 'Failed to create Monobank invoice');
        }

        // --- Тут ви б мали створити запис Order у базі даних зі статусом PENDING ---

        // Повертаємо URL сторінки оплати
        return NextResponse.json({ pageUrl: monoData.pageUrl }, { status: 200 });

    } catch (error) {
        console.error('Error creating Monobank payment:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}