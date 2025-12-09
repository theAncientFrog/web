import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - отримати вільні години для бронювання на конкретну дату та столик
export async function GET(
    request: Request,
    context: { params: { restaurantId: string } }
) {
    try {
        const { restaurantId } = context.params;
        const numericRestaurantId = parseInt(restaurantId);
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const tableId = searchParams.get('tableId');

        if (isNaN(numericRestaurantId)) {
            return NextResponse.json({ message: 'Некоректний ID ресторану' }, { status: 400 });
        }

        if (!date) {
            return NextResponse.json({ message: 'Дата обов\'язкова' }, { status: 400 });
        }

        // Генеруємо список всіх можливих годин (наприклад, з 10:00 до 22:00)
        const startHour = 10;
        const endHour = 22;
        const allTimeSlots = [];
        
        for (let hour = startHour; hour <= endHour; hour++) {
            allTimeSlots.push(`${String(hour).padStart(2, '0')}:00`);
            if (hour < endHour) {
                allTimeSlots.push(`${String(hour).padStart(2, '0')}:30`);
            }
        }

        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Отримуємо всі бронювання на цю дату для ресторану
        // @ts-ignore
        const reservations = await prisma.reservation.findMany({
            where: {
                restaurantId: numericRestaurantId,
                reservedAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            select: {
                reservedAt: true
            }
        });

        // Створюємо Set зайнятих годин з урахуванням 1.5 години до і після
        const bookedTimeSlots = new Set();
        const reservationDuration = 1.5 * 60 * 60 * 1000; // 1.5 години в мілісекундах
        
        reservations.forEach(reservation => {
            const reservedDateTime = new Date(reservation.reservedAt);
            const reservedStart = new Date(reservedDateTime.getTime() - reservationDuration); // 1.5 години до
            const reservedEnd = new Date(reservedDateTime.getTime() + reservationDuration); // 1.5 години після
            
            // Додаємо всі часові слоти, які перекриваються з цим бронюванням
            allTimeSlots.forEach(timeSlot => {
                const [hours, minutes] = timeSlot.split(':').map(Number);
                const slotDateTime = new Date(selectedDate);
                slotDateTime.setHours(hours, minutes, 0, 0);
                
                // Якщо часовий слот перекривається з бронюванням (в межах 1.5 години до або після)
                if (slotDateTime >= reservedStart && slotDateTime <= reservedEnd) {
                    bookedTimeSlots.add(timeSlot);
                }
            });
        });

        // Фільтруємо вільні години
        const availableTimes = allTimeSlots.filter(time => !bookedTimeSlots.has(time));

        // Якщо це сьогодні, прибираємо минулі години
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateOnly = new Date(selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);

        if (selectedDateOnly.getTime() === today.getTime()) {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            return NextResponse.json({
                availableTimes: availableTimes.filter(time => time > currentTime)
            });
        }

        return NextResponse.json({ availableTimes });
    } catch (error) {
        console.error('Помилка при отриманні вільних годин:', error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}

