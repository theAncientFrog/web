// This is a file representation.
// You can directly edit, format, and save this code.
// Your changes will be reflected in the user's view.

import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { checkAndAwardAchievements } from '@/lib/achievementService'; // 💡 1. Імпорт Ачівок

// Ініціалізація Pusher (тільки якщо змінні оточення налаштовані)
let pusher: Pusher | null = null;
try {
    if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER) {
        pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.PUSHER_CLUSTER,
            useTLS: true,
        });
    } else {
        console.warn('[Pusher] Змінні оточення не налаштовані. Pusher буде вимкнено.');
    }
} catch (error) {
    console.error('[Pusher] Помилка ініціалізації:', error);
}

// Тип для даних, що надходять з кошика клієнта
type CartItem = {
    dishId: number;
    quantity: number;
};

// ... (Інші типи: PusherItemDetails, OrderItemCreateData) ...
// Тип даних для Pusher
type PusherItemDetails = {
    name: string;
    quantity: number;
    price: number;
};

// Тип для Prisma nested write
type OrderItemCreateData = {
    dishId: number;
    quantity: number;
    price: number; // Ціна для OrderItem
    priceAtPurchase: number; // Зберігаємо ціну на момент покупки
};

export async function POST(request: Request) {
    try {
        // 1. АВТЕНТИФІКАЦІЯ
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Неавторизовано. Увійдіть, щоб зробити замовлення.' }, { status: 401 });
        }
        const userId = Number(session.user.id);

        // 2. ОТРИМАННЯ ДАНИХ З ТІЛА ЗАПИТУ
        const body: { cart: CartItem[]; restaurantId: string } = await request.json();
        const { cart, restaurantId } = body;

        // 3. ВАЛІДАЦІЯ ВХІДНИХ ДАНИХ
        if (!cart || cart.length === 0) {
            return NextResponse.json({ message: 'Кошик порожній' }, { status: 400 });
        }

        if (!restaurantId) {
            return NextResponse.json({ message: 'Не вказано ID ресторану' }, { status: 400 });
        }

        const numericRestaurantId = Number(restaurantId);
        if (isNaN(numericRestaurantId)) {
            return NextResponse.json({ message: 'Некоректний ID ресторану' }, { status: 400 });
        }

        // 4. ОТРИМАННЯ ДАНИХ З БД ТА ВАЛІДАЦІЯ
        const dishIds = cart.map((item) => item.dishId);

        const dishesFromDb = await prisma.dish.findMany({
            where: { id: { in: dishIds } },
            include: { 
                category: { 
                    include: {
                        parent: {
                            select: {
                                id: true,
                                parentId: true
                            }
                        }
                    }
                } 
            }
        });

        if (dishesFromDb.length !== cart.length) {
            const foundIds = new Set(dishesFromDb.map(d => d.id));
            const missingIds = dishIds.filter(id => !foundIds.has(id));
            return NextResponse.json({ message: `Страви з ID: ${missingIds.join(', ')} не знайдено` }, { status: 404 });
        }

        const allDishesMatchRestaurant = dishesFromDb.every(
            dish => dish.category.restaurantId === numericRestaurantId
        );

        if (!allDishesMatchRestaurant) {
            return NextResponse.json({ message: 'Кошик містить страви з різних ресторанів або ID ресторану невірний.' }, { status: 400 });
        }

        // 5. РОЗРАХУНОК СУМИ та підготовка OrderItem даних
        let totalPrice = 0;
        const dishDetailsMap = new Map(
            dishesFromDb.map((item) => [item.id, { price: item.price, name: item.name }])
        );

        const itemsToCreate: OrderItemCreateData[] = [];
        const itemsForPusher: PusherItemDetails[] = [];

        for (const cartItem of cart) {
            const details = dishDetailsMap.get(cartItem.dishId);

            if (details) {
                const itemTotalPrice = details.price * cartItem.quantity;
                totalPrice += itemTotalPrice;

                itemsToCreate.push({
                    dishId: cartItem.dishId,
                    quantity: cartItem.quantity,
                    price: details.price, // Ціна для OrderItem
                    priceAtPurchase: details.price, // Ціна на момент покупки
                });

                itemsForPusher.push({
                    name: details.name,
                    quantity: cartItem.quantity,
                    price: details.price
                });
            }
        }

        // 6. ЗБЕРЕЖЕННЯ В БД (Транзакція)
        console.log('[Order] Створення замовлення:', {
            userId,
            restaurantId: numericRestaurantId,
            totalPrice,
            itemsCount: itemsToCreate.length
        });

        let savedOrder;
        try {
            console.log('[Order] Дані для створення замовлення:', {
                userId,
                restaurantId: numericRestaurantId,
                totalPrice,
                itemsCount: itemsToCreate.length,
                itemsPreview: itemsToCreate.slice(0, 3).map(item => ({
                    dishId: item.dishId,
                    quantity: item.quantity,
                    price: item.price,
                    priceAtPurchase: item.priceAtPurchase
                }))
            });

            savedOrder = await prisma.order.create({
                data: {
                    userId: userId,
                    restaurantId: numericRestaurantId,
                    totalPrice: totalPrice,
                    status: 'PENDING', // 💡 Статус замовлення
                    items: {
                        create: itemsToCreate,
                    }
                },
                include: {
                    items: {
                        include: { dish: { select: { name: true } } }
                    },
                    user: {
                        select: { name: true, email: true }
                    }
                }
            });
            console.log('[Order] ✅ Замовлення успішно створено:', savedOrder.id);
        } catch (prismaError: any) {
            console.error('[Order] ❌ Помилка Prisma при створенні замовлення:', {
                code: prismaError.code,
                message: prismaError.message,
                meta: prismaError.meta,
                stack: prismaError.stack
            });
            
            // Повертаємо більш зрозуміле повідомлення про помилку
            if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
                if (prismaError.code === 'P2003') {
                    return NextResponse.json({ 
                        message: 'Помилка зв\'язку даних. Перевірте, чи всі страви та ресторан існують.' 
                    }, { status: 400 });
                }
                if (prismaError.code === 'P2002') {
                    return NextResponse.json({ 
                        message: 'Помилка: дублікат запису. Спробуйте ще раз.' 
                    }, { status: 400 });
                }
            }
            
            return NextResponse.json({ 
                message: `Помилка при створенні замовлення: ${prismaError.message}` 
            }, { status: 500 });
        }

        // 7. PUSHER: Сповіщаємо власника ресторану
        // Обробка помилок Pusher, щоб не блокувати створення замовлення
        if (pusher) {
            try {
                const channelName = `restaurant-${restaurantId}`;
                const eventName = 'new-order';

                const pusherPayload = {
                    message: `Нове замовлення! (ID: ${savedOrder.id})`,
                    order: {
                        id: savedOrder.id,
                        totalPrice: savedOrder.totalPrice,
                        status: savedOrder.status,
                        createdAt: savedOrder.createdAt,
                        items: savedOrder.items.map(item => ({
                            name: item.dish.name,
                            quantity: item.quantity,
                            priceAtPurchase: item.priceAtPurchase
                        }))
                    },
                    userName: savedOrder.user.name || session.user.name || 'Анонімний клієнт',
                    userEmail: savedOrder.user.email || session.user.email,
                };

                await pusher.trigger(channelName, eventName, pusherPayload);
                console.log(`[Pusher] Сповіщення відправлено для ресторану ${restaurantId}`);
            } catch (pusherError) {
                // Логуємо помилку, але не блокуємо створення замовлення
                console.error('[Pusher] Помилка при відправці сповіщення:', pusherError);
                // Замовлення все одно створено успішно, тому продовжуємо
            }
        } else {
            console.warn('[Pusher] Pusher не ініціалізовано. Сповіщення не відправлено.');
        }

        // 💡 --- 8. НОВА ЛОГІКА РІВНІВ КАТЕГОРІЙ (XP) ---
        // Для кожної страви знаходимо головну категорію та додаємо XP
        // Обгортаємо в try-catch, щоб помилки не блокували створення замовлення
        try {
            const categoryXpMap = new Map<number, number>(); // categoryId -> xp

            for (const cartItem of cart) {
                try {
                    const dish = dishesFromDb.find(d => d.id === cartItem.dishId);
                    if (!dish) {
                        console.warn(`[Category Loyalty] Страва з ID ${cartItem.dishId} не знайдена`);
                        continue;
                    }

                    // Знаходимо головну категорію (якщо страва в підкатегорії)
                    let mainCategoryId = dish.category.id;
                    
                    if (dish.category.parentId !== null) {
                        // Якщо є батьківська категорія, використовуємо її
                        if (dish.category.parent) {
                            mainCategoryId = dish.category.parent.id;
                        } else {
                            // Якщо parent не завантажено, завантажуємо його
                            try {
                                const categoryWithParent = await prisma.category.findUnique({
                                    where: { id: dish.category.id },
                                    include: {
                                        parent: {
                                            select: {
                                                id: true,
                                                parentId: true
                                            }
                                        }
                                    }
                                });
                                if (categoryWithParent?.parent) {
                                    mainCategoryId = categoryWithParent.parent.id;
                                } else if (categoryWithParent?.parentId) {
                                    mainCategoryId = categoryWithParent.parentId;
                                }
                            } catch (parentError: any) {
                                console.error(`[Category Loyalty] Помилка при завантаженні parent для категорії ${dish.category.id}:`, parentError.message);
                                // Використовуємо поточну категорію як головну
                            }
                        }
                    }

                    // Розраховуємо XP для цієї страви (1 грн = 1 XP)
                    const itemXp = Math.floor(dish.price * cartItem.quantity);
                    const currentXp = categoryXpMap.get(mainCategoryId) || 0;
                    categoryXpMap.set(mainCategoryId, currentXp + itemXp);
                    console.log(`[Category Loyalty] Страва ${dish.id} (категорія ${dish.category.id}, parentId: ${dish.category.parentId}) → головна категорія ${mainCategoryId}, XP: ${itemXp}`);
                } catch (itemError: any) {
                    console.error(`[Category Loyalty] Помилка при обробці страви ${cartItem.dishId}:`, itemError.message);
                    // Продовжуємо з наступною стравою
                }
            }

            // Оновлюємо XP для кожної категорії
            console.log(`[Category Loyalty] Оновлюємо статистику для ${categoryXpMap.size} категорій`);
            for (const [categoryId, xpGained] of Array.from(categoryXpMap.entries())) {
                try {
                    // Перевіряємо, чи існує категорія
                    const categoryExists = await prisma.category.findUnique({
                        where: { id: categoryId }
                    });
                    
                    if (!categoryExists) {
                        console.error(`[Category Loyalty] Категорія ${categoryId} не існує, пропускаємо`);
                        continue;
                    }

                    const result = await prisma.userCategoryStats.upsert({
                        where: {
                            userId_categoryId: {
                                userId: userId,
                                categoryId: categoryId,
                            },
                        },
                        update: {
                            xp: {
                                increment: xpGained,
                            },
                        },
                        create: {
                            userId: userId,
                            categoryId: categoryId,
                            restaurantId: numericRestaurantId,
                            xp: xpGained,
                        },
                    });
                    console.log(`[Category Loyalty] ✅ Юзер ${userId} отримав ${xpGained} XP для категорії ${categoryId}. Поточний XP: ${result.xp}`);
                } catch (categoryError: any) {
                    console.error(`[Category Loyalty] ❌ Помилка при оновленні статистики категорії ${categoryId}:`, {
                        code: categoryError.code,
                        message: categoryError.message,
                        meta: categoryError.meta
                    });
                    // Продовжуємо, навіть якщо є помилка з однією категорією
                }
            }

            // Розраховуємо рівень закладу на основі середнього рівня категорій
            try {
                const categoryStats = await prisma.userCategoryStats.findMany({
                    where: {
                        userId: userId,
                        restaurantId: numericRestaurantId,
                    },
                });

                if (categoryStats.length > 0) {
                    const totalXp = categoryStats.reduce((sum, stat) => sum + stat.xp, 0);
                    const averageXp = Math.floor(totalXp / categoryStats.length);
                    
                    await prisma.userRestaurantStats.upsert({
                        where: {
                            userId_restaurantId: {
                                userId: userId,
                                restaurantId: numericRestaurantId,
                            },
                        },
                        update: {
                            xp: averageXp,
                        },
                        create: {
                            userId: userId,
                            restaurantId: numericRestaurantId,
                            xp: averageXp,
                        },
                    });
                    console.log(`[Restaurant Loyalty] Рівень закладу оновлено до ${averageXp} XP (середнє з ${categoryStats.length} категорій)`);
                }
            } catch (restaurantLoyaltyError: any) {
                console.error('[Restaurant Loyalty] Помилка при оновленні рівня закладу:', {
                    code: restaurantLoyaltyError.code,
                    message: restaurantLoyaltyError.message,
                    meta: restaurantLoyaltyError.meta
                });
                // Продовжуємо, навіть якщо є помилка з оновленням рівня закладу
            }
        } catch (categoryLoyaltyError: any) {
            // Якщо вся логіка категорій падає, логуємо помилку, але не блокуємо створення замовлення
            console.error('[Category Loyalty] Критична помилка при обробці лояльності категорій:', {
                message: categoryLoyaltyError.message,
                stack: categoryLoyaltyError.stack
            });
        }
        // --- КІНЕЦЬ ЛОГІКИ РІВНІВ КАТЕГОРІЙ ---


        // 💡 --- 9. ЛОГІКА АЧІВОК (залишається) ---
        // Перевірка ачівок відбудеться у фоновому режимі.
        // ВАЖЛИВО: 'checkAndAwardAchievements' має бути оновлений,
        // щоб перевіряти статус 'COMPLETED' для замовлень.
        checkAndAwardAchievements(userId).catch(err => {
            console.error(`[Achievements] Помилка при перевірці ачівок для користувача ${userId}:`, err);
        });


        // 10. УСПІШНА ВІДПОВІДЬ
        return NextResponse.json({ success: true, orderId: savedOrder.id }, { status: 201 });

    } catch (error) {
        console.error('Помилка при створенні замовлення:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return NextResponse.json({ message: 'Помилка зв\'язку даних (напр. ID страви або користувача не існує)' }, { status: 400 });
            }
        }

        return NextResponse.json({ message: 'Внутрішня помишка сервера' }, { status: 500 });
    }
}

