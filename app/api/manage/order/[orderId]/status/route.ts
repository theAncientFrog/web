// app/api/manage/order/[orderId]/status/route.ts
import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { getServerSession } from 'next-auth/next';
import { checkAndAwardAchievements } from '@/lib/achievementService';

// Вказуємо Next.js, що цей роут завжди динамічний (для Vercel)
export const dynamic = 'force-dynamic';

// Леніва ініціалізація Pusher (тільки якщо змінні оточення налаштовані)
let pusher: Pusher | null = null;

function getPusher(): Pusher | null {
    if (!pusher) {
        if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER) {
            try {
                pusher = new Pusher({
                    appId: process.env.PUSHER_APP_ID,
                    key: process.env.PUSHER_KEY,
                    secret: process.env.PUSHER_SECRET,
                    cluster: process.env.PUSHER_CLUSTER,
                    useTLS: true,
                });
            } catch (error) {
                console.error('[Pusher] Помилка ініціалізації:', error);
                return null;
            }
        } else {
            console.warn('[Pusher] Змінні оточення не налаштовані. Pusher буде вимкнено.');
            return null;
        }
    }
    return pusher;
}

// ▼▼▼ Явне визначення допустимих статусів ▼▼▼
type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export async function PUT(
    request: Request,
    { params }: { params: { orderId: string } }
) {
    try {
        // 1. Перевірка авторизації
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'OWNER') {
            return NextResponse.json({ message: 'Недостатньо прав' }, { status: 403 });
        }

        const orderId = parseInt(params.orderId);

        // 2. Отримуємо статус та явно приводимо його до нашого типу OrderStatus
        const { status } = await request.json();
        const newStatus = status as OrderStatus; // ⬅️ ВИПРАВЛЕНО

        // 3. Об'єкт сповіщень (тепер безпечний для використання з newStatus)
        const statusMap = {
            'PREPARING': 'прийнято до приготування! 👨‍🍳',
            'READY': 'готове та очікує видачі! 🛎️',
            'PENDING': 'очікує',
            'COMPLETED': 'видано',
            'CANCELLED': 'скасовано ❌'
        } as const;

        // 4. Оновлення статусу в базі даних
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
            // 💡 --- ОНОВЛЕНО ---
            // Додаємо totalPrice, щоб знати, скільки XP нарахувати
            select: {
                userId: true,
                id: true,
                status: true,
                restaurantId: true,
                totalPrice: true // 👈 Додано
            }
        });

        // 💡 --- 5. ДОДАНО ЛОГІКУ НАРАХУВАННЯ XP ---
        // XP нараховується тільки для завершених замовлень, не для скасованих
        if (newStatus === 'COMPLETED') {
            // Формула: 1 гривня = 1 XP.
            // Ви можете змінити, наприклад: Math.floor(updatedOrder.totalPrice * 0.5)
            const xpToAdd = Math.floor(updatedOrder.totalPrice);

            if (xpToAdd > 0) {
                // Використовуємо upsert:
                // - update: якщо запис є, додаємо XP
                // - create: якщо це перше замовлення, створюємо запис
                await prisma.userRestaurantStats.upsert({
                    where: {
                        userId_restaurantId: {
                            userId: updatedOrder.userId,
                            restaurantId: updatedOrder.restaurantId,
                        },
                    },
                    update: {
                        xp: {
                            increment: xpToAdd, // Атомно додаємо
                        },
                    },
                    create: {
                        userId: updatedOrder.userId,
                        restaurantId: updatedOrder.restaurantId,
                        xp: xpToAdd,
                    },
                });
            }
        }
        // --- КІНЕЦЬ ЛОГІКИ XP ---

        // 💡 --- 5.5. ПЕРЕВІРКА АЧІВОК ПРИ ЗАВЕРШЕННІ ЗАМОВЛЕННЯ ---
        if (newStatus === 'COMPLETED') {
            console.log(`[Order Status] 🎯 Замовлення ${orderId} завершено. Перевіряємо ачівки для користувача ${updatedOrder.userId}`);
            // Перевіряємо та видаємо ачівки в фоновому режимі
            checkAndAwardAchievements(updatedOrder.userId).catch(err => {
                console.error(`[Achievements] ❌ Помилка при перевірці ачівок для користувача ${updatedOrder.userId}:`, err);
            });
        }
        // --- КІНЕЦЬ ЛОГІКИ АЧІВОК ---

        // 6. Надсилання сповіщення клієнту (колишній крок 5)
        const pusherInstance = getPusher();
        if (pusherInstance) {
            try {
                const channelName = `user-${updatedOrder.userId}`;
                const eventName = 'order-status-update';

                await pusherInstance.trigger(channelName, eventName, {
                    orderId: updatedOrder.id,
                    newStatus: updatedOrder.status,
                    message: `Ваше замовлення #${updatedOrder.id} було ${statusMap[newStatus]}`,
                });
            } catch (pusherError) {
                console.error('[Pusher] Помилка при відправці сповіщення:', pusherError);
                // Продовжуємо, навіть якщо Pusher не працює
            }
        }

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json({ message: 'Помилка сервера' }, { status: 500 });
    }
}