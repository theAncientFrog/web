// This is a file representation.
// You can directly edit, format, and save this code.
// Your changes will be reflected in the user's view.

import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { checkAndAwardAchievements } from '@/lib/achievementService';

// Вказуємо Next.js, що цей роут завжди динамічний (для Vercel)
export const dynamic = 'force-dynamic';

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
    priceAtPurchase: number; // Зберігаємо ціну на момент покупки
};

export async function POST(request: Request) {
    try {
        console.log('[Order] ===== STARTING ORDER CREATION =====');

        // 1. АВТЕНТИФІКАЦІЯ
        const session = await getServerSession(authOptions);
        console.log('[Order] Session:', session?.user?.id ? 'Authenticated' : 'Not authenticated');

        if (!session?.user?.id) {
            console.log('[Order] ERROR: User not authenticated');
            return NextResponse.json({ message: 'Неавторизовано. Увійдіть, щоб зробити замовлення.' }, { status: 401 });
        }
        const userId = Number(session.user.id);
        console.log('[Order] User ID:', userId);

        let loyaltyErrorOccurred = false;

        // 2. ОТРИМАННЯ ДАНИХ З ТІЛА ЗАПИТУ
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            console.error('[Order] Failed to parse request body:', parseError);
            return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
        }

        const { cart, restaurantId, tableNumber } = body;

        // Детальна валідація вхідних даних
        console.log('[Order] ===== RECEIVED REQUEST =====');
        console.log('[Order] Raw body:', JSON.stringify(body, null, 2));
        console.log('[Order] Cart items:', cart?.length || 0);
        console.log('[Order] Restaurant ID:', restaurantId);
        console.log('[Order] Table number:', tableNumber);

        // Валідація структури cart
        if (!Array.isArray(cart)) {
            console.error('[Order] Cart is not an array:', cart);
            return NextResponse.json({ message: 'Cart must be an array' }, { status: 400 });
        }

        if (cart.length === 0) {
            console.error('[Order] Cart is empty');
            return NextResponse.json({ message: 'Cart cannot be empty' }, { status: 400 });
        }

        // Перевірка структури кожного елемента cart
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            if (!item || typeof item !== 'object') {
                console.error(`[Order] Cart item ${i} is not an object:`, item);
                return NextResponse.json({ message: `Invalid cart item at index ${i}` }, { status: 400 });
            }
            if (!item.dishId || !item.quantity) {
                console.error(`[Order] Cart item ${i} missing dishId or quantity:`, item);
                return NextResponse.json({ message: `Cart item ${i} missing required fields` }, { status: 400 });
            }
            if (typeof item.dishId !== 'number' || typeof item.quantity !== 'number') {
                console.error(`[Order] Cart item ${i} has wrong types:`, item);
                return NextResponse.json({ message: `Cart item ${i} has invalid data types` }, { status: 400 });
            }
        }

        // 3. ВАЛІДАЦІЯ ВХІДНИХ ДАНИХ
        console.log('[Order] Received cart:', cart);
        console.log('[Order] Received restaurantId:', restaurantId);

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

        // Перевіряємо існування користувача та ресторану
        const [userExists, restaurantExists] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.restaurant.findUnique({ where: { id: numericRestaurantId } })
        ]);

        if (!userExists) {
            console.error(`[Order] User ${userId} does not exist`);
            return NextResponse.json({ message: 'Користувач не знайдений' }, { status: 400 });
        }

        if (!restaurantExists) {
            console.error(`[Order] Restaurant ${numericRestaurantId} does not exist`);
            return NextResponse.json({ message: 'Ресторан не знайдений' }, { status: 400 });
        }

        console.log('[Order] User and restaurant validation passed');

        // 4. ОТРИМАННЯ ДАНИХ З БД ТА ВАЛІДАЦІЯ
        const dishIds = cart.map((item) => item.dishId);
        console.log('[Order] Dish IDs from cart:', dishIds);

        // Перевірка, чи існують страви з такими ID
        const existingDishes = await prisma.dish.findMany({
            where: { id: { in: dishIds } },
            select: { id: true }
        });
        const existingDishIds = existingDishes.map(d => d.id);
        const missingDishIds = dishIds.filter(id => !existingDishIds.includes(id));

        if (missingDishIds.length > 0) {
            console.error('[Order] Missing dish IDs:', missingDishIds);
            return NextResponse.json({
                message: `Страви з ID: ${missingDishIds.join(', ')} не знайдено в базі даних`
            }, { status: 400 });
        }

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

        console.log('[Order] Found dishes in DB:', dishesFromDb.length, 'Expected:', cart.length);
        console.log('[Order] Dish IDs requested:', dishIds);

        if (dishesFromDb.length !== cart.length) {
            const foundIds = new Set(dishesFromDb.map(d => d.id));
            const missingIds = dishIds.filter(id => !foundIds.has(id));
            console.error('[Order] Missing dish IDs:', missingIds);
            return NextResponse.json({ message: `Страви з ID: ${missingIds.join(', ')} не знайдено` }, { status: 404 });
        }

        console.log('[Order] Checking restaurant match...');
        const allDishesMatchRestaurant = dishesFromDb.every(
            dish => dish.category.restaurantId === numericRestaurantId
        );

        console.log('[Order] Restaurant validation:', {
            expectedRestaurantId: numericRestaurantId,
            dishRestaurantIds: dishesFromDb.map(d => ({ dishId: d.id, restaurantId: d.category.restaurantId }))
        });

        if (!allDishesMatchRestaurant) {
            const mismatchedDishes = dishesFromDb.filter(dish => dish.category.restaurantId !== numericRestaurantId);
            console.error('[Order] Mismatched dishes:', mismatchedDishes.map(d => ({ id: d.id, expected: numericRestaurantId, actual: d.category.restaurantId })));
            return NextResponse.json({
                message: `Кошик містить страви з різних ресторанів. Очікуваний ресторан: ${numericRestaurantId}, знайдені ресторани: ${[...new Set(dishesFromDb.map(d => d.category.restaurantId))].join(', ')}`
            }, { status: 400 });
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
                    priceAtPurchase: Number(details.price), // Ціна на момент покупки
                } as OrderItemCreateData);

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
                    priceAtPurchase: item.priceAtPurchase
                }))
            });

            // Переконуємося, що структура даних правильна
            const orderItemsData = itemsToCreate.map(item => ({
                dishId: item.dishId,
                quantity: item.quantity,
                priceAtPurchase: item.priceAtPurchase,
            }));

            console.log('[Order] Creating order with data:', {
                userId,
                restaurantId: numericRestaurantId,
                totalPrice,
                itemCount: orderItemsData.length,
                items: orderItemsData
            });

            try {
                savedOrder = await prisma.order.create({
                    data: {
                        userId: userId,
                        restaurantId: numericRestaurantId,
                        totalPrice: totalPrice,
                        status: 'PENDING' as const,
                        tableNumber: tableNumber || null,
                        items: {
                            create: orderItemsData,
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
                console.log('[Order] Order created successfully with ID:', savedOrder.id);
            } catch (createError: any) {
                console.error('[Order] Failed to create order:', {
                    code: createError.code,
                    message: createError.message,
                    meta: createError.meta
                });
                throw createError; // Re-throw to be caught by outer try-catch
            }
            console.log('[Order] ✅ Замовлення успішно створено:', savedOrder.id);
            console.log('[Order] tableNumber збережено:', (savedOrder as any).tableNumber);
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
                        tableNumber: (savedOrder as any).tableNumber || null,
                        items: (savedOrder as any).items.map((item: any) => ({
                            name: item.dish.name,
                            quantity: item.quantity,
                            priceAtPurchase: item.priceAtPurchase
                        }))
                    },
                    userName: (savedOrder as any).user?.name || session.user.name || 'Анонімний клієнт',
                    userEmail: (savedOrder as any).user?.email || session.user.email,
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

        // Для кожної страви знаходимо ПІДКАТЕГОРІЮ та додаємо XP
        // Обгортаємо в try-catch, щоб помилки не блокували створення замовлення
        // Система лояльності підкатегорій
        try {
            console.log(`[Subcategory Loyalty] Starting loyalty calculation for ${cart.length} items`);

            // Перевіряємо, чи всі необхідні дані завантажено
            if (!dishesFromDb || dishesFromDb.length === 0) {
                console.warn('[Subcategory Loyalty] No dishes found, skipping loyalty system');
                throw new Error('No dish data available for loyalty calculation');
            }
            const subcategoryXpMap = new Map<number, number>(); // subcategoryId -> xp

            for (const cartItem of cart) {
                try {
                    console.log(`[Subcategory Loyalty] Processing cart item: dishId=${cartItem.dishId}, quantity=${cartItem.quantity}`);
                    const dish = dishesFromDb.find(d => d.id === cartItem.dishId);
                    if (!dish) {
                        console.warn(`[Subcategory Loyalty] Страва з ID ${cartItem.dishId} не знайдена в dishesFromDb`);
                        continue;
                    }
                    console.log(`[Subcategory Loyalty] Found dish: ${dish.name}, categoryId: ${dish.categoryId}`);

                    // Використовуємо ПІДКАТЕГОРІЮ (якщо страва в підкатегорії, використовуємо її,
                    // якщо в основній категорії, то вона сама є підкатегорією)
                    let subcategoryId = dish.category.id;
                    console.log(`[Subcategory Loyalty] Dish category: ${JSON.stringify(dish.category)}`);

                    // Розраховуємо XP для цієї страви (1 грн = 1 XP)
                    const itemXp = Math.floor(dish.price * cartItem.quantity);
                    const currentXp = subcategoryXpMap.get(subcategoryId) || 0;
                    subcategoryXpMap.set(subcategoryId, currentXp + itemXp);
                    console.log(`[Subcategory Loyalty] Страва ${dish.id} (ціна: ${dish.price}₴ × ${cartItem.quantity}) → підкатегорія ${subcategoryId}, XP: ${itemXp}`);
                } catch (itemError: any) {
                    console.error(`[Subcategory Loyalty] Помилка при обробці страви ${cartItem.dishId}:`, itemError.message);
                    // Продовжуємо з наступною стравою
                }
            }

            // Оновлюємо XP для кожної ПІДКАТЕГОРІЇ
            console.log(`[Subcategory Loyalty] Оновлюємо статистику для ${subcategoryXpMap.size} підкатегорій`);
            for (const [subcategoryId, xpGained] of Array.from(subcategoryXpMap.entries())) {
                try {
                    // Перевіряємо, чи існує підкатегорія
                    const subcategoryExists = await prisma.category.findUnique({
                        where: { id: subcategoryId },
                        select: { id: true, parentId: true }
                    });

                    if (!subcategoryExists) {
                        console.error(`[Subcategory Loyalty] Підкатегорія ${subcategoryId} не існує, пропускаємо`);
                        continue;
                    }

                    console.log(`[Subcategory Loyalty] Executing upsert for user ${userId}, subcategory ${subcategoryId}, xp ${xpGained}`);

                    try {
                        const result = await prisma.userSubcategoryStats.upsert({
                            where: {
                                userId_subcategoryId: {
                                    userId: userId,
                                    subcategoryId: subcategoryId,
                                },
                            },
                            update: {
                                xp: {
                                    increment: xpGained,
                                },
                            },
                            create: {
                                userId: userId,
                                subcategoryId: subcategoryId,
                                restaurantId: numericRestaurantId,
                                xp: xpGained,
                            },
                        });
                        console.log(`[Subcategory Loyalty] ✅ Юзер ${userId} отримав ${xpGained} XP для підкатегорії ${subcategoryId}. Поточний XP: ${result.xp}`);
                    } catch (upsertError: any) {
                        console.error(`[Subcategory Loyalty] ❌ Помилка upsert для підкатегорії ${subcategoryId}:`, {
                            code: upsertError.code,
                            message: upsertError.message,
                            meta: upsertError.meta
                        });
                        loyaltyErrorOccurred = true;
                        // Продовжуємо з іншими підкатегоріями
                        continue;
                    }
                } catch (subcategoryError: any) {
                    console.error(`[Subcategory Loyalty] ❌ Помилка при оновленні статистики підкатегорії ${subcategoryId}:`, {
                        code: subcategoryError.code,
                        message: subcategoryError.message,
                        meta: subcategoryError.meta
                    });
                    // Продовжуємо, навіть якщо є помилка з однією підкатегорією
                }
            }

            // Розраховуємо рівень закладу на основі середнього рівня ПІДКАТЕГОРІЙ
            try {
                const subcategoryStats = await prisma.userSubcategoryStats.findMany({
                    where: {
                        userId: userId,
                        restaurantId: numericRestaurantId,
                    },
                });

                if (subcategoryStats.length > 0) {
                    const totalXp = subcategoryStats.reduce((sum, stat) => sum + stat.xp, 0);
                    const averageXp = Math.floor(totalXp / subcategoryStats.length);

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
                    console.log(`[Restaurant Loyalty] Рівень закладу оновлено до ${averageXp} XP (середнє з ${subcategoryStats.length} підкатегорій)`);
                }
            } catch (restaurantLoyaltyError: any) {
                console.error('[Restaurant Loyalty] Помилка при оновленні рівня закладу:', {
                    code: restaurantLoyaltyError.code,
                    message: restaurantLoyaltyError.message,
                    meta: restaurantLoyaltyError.meta
                });
                // Продовжуємо, навіть якщо є помилка з оновленням рівня закладу
            }
        } catch (subcategoryLoyaltyError: any) {
            // Якщо вся логіка підкатегорій падає, логуємо помилку, але не блокуємо створення замовлення
            loyaltyErrorOccurred = true;
            console.error('[Subcategory Loyalty] Критична помилка при обробці лояльності підкатегорій:', {
                message: subcategoryLoyaltyError.message,
                stack: subcategoryLoyaltyError.stack
            });
            console.error('[Order] ⚠️ ПОПЕРЕДЖЕННЯ: Система лояльності підкатегорій не працює!');
        }
        // --- КІНЕЦЬ ЛОГІКИ РІВНІВ ПІДКАТЕГОРІЙ ---


        // Перевірка ачівок відбудеться у фоновому режимі.
        // ВАЖЛИВО: 'checkAndAwardAchievements' має бути оновлений,
        // щоб перевіряти статус 'COMPLETED' для замовлень.
        checkAndAwardAchievements(userId).catch(err => {
            console.error(`[Achievements] Помилка при перевірці ачівок для користувача ${userId}:`, err);
        });


        console.log('[Order] ===== ORDER COMPLETED SUCCESSFULLY =====');
        console.log('[Order] Order ID:', savedOrder.id, 'User ID:', userId);

        // 10. УСПІШНА ВІДПОВІДЬ
        console.log('[Order] ===== ORDER PROCESSING COMPLETE =====');
        return NextResponse.json({
            success: true,
            orderId: savedOrder.id,
            loyaltyStatus: loyaltyErrorOccurred ? 'error' : 'success'
        }, { status: 201 });

    } catch (error) {
        console.error('[Order] ===== ORDER CREATION FAILED =====');
        console.error('Помилка при створенні замовлення:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return NextResponse.json({ message: 'Помилка зв\'язку даних (напр. ID страви або користувача не існує)' }, { status: 400 });
            }
        }

        return NextResponse.json({ message: 'Внутрішня помишка сервера' }, { status: 500 });
    }
}

