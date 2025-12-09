import { prisma } from './prisma';

/**
 * Допоміжна функція для видачі ачівки
 * @param userId - ID користувача
 * @param achievementCode - Унікальний код ачівки (напр. "EXPLORER_1")
 */
async function grantAchievement(userId: number, achievementCode: string) {
    try {
        // Знаходимо ачівку в базі за її кодом
        const achievement = await prisma.achievement.findUnique({
            where: { code: achievementCode }
        });

        // Якщо ачівки з таким кодом немає в БД, логуємо і виходимо
        if (!achievement) {
            console.warn(`[Achievements] Ачівку з кодом ${achievementCode} не знайдено в базі даних.`);
            return;
        }

        // Створюємо запис про те, що користувач отримав цю ачівку
        // Використовуємо createMany + skipDuplicates, щоб уникнути помилки,
        // якщо такий запис вже існує (завдяки @@unique в схемі).
        const result = await prisma.userAchievement.createMany({
            data: {
                userId: userId,
                achievementId: achievement.id
            },
            skipDuplicates: true
        });

        if (result.count > 0) {
            console.log(`[Achievements] ✅ Користувачу ${userId} видано ачівку ${achievementCode} (ID: ${achievement.id})`);
        } else {
            console.log(`[Achievements] ℹ️ Користувач ${userId} вже має ачівку ${achievementCode}`);
        }
    } catch (error) {
        console.error(`[Achievements] Помилка при видачі ачівки ${achievementCode} користувачу ${userId}:`, error);
        // Не кидаємо помилку далі, щоб не порушити основний процес
    }
}


/**
 * Перевіряє та видає ачівки для користувача на основі його замовлень
 * @param userId - ID користувача, для якого робиться перевірка
 */
export async function checkAndAwardAchievements(userId: number) {
    try {
        console.log(`[Achievements] 🔍 Початок перевірки ачівок для користувача ${userId}`);
        
        // 1. Отримуємо всі замовлення користувача
        // Враховуємо лише завершені замовлення
        const userOrders = await prisma.order.findMany({
            where: {
                userId: userId,
                status: 'COMPLETED'
            },
            select: { restaurantId: true } // Нам потрібні лише ID ресторанів
        });

        console.log(`[Achievements] 📊 Знайдено ${userOrders.length} завершених замовлень для користувача ${userId}`);

        // Якщо у користувача немає завершених замовлень, нічого не робимо
        if (userOrders.length === 0) {
            console.log(`[Achievements] ⚠️ У користувача ${userId} немає завершених замовлень. Перевірка завершена.`);
            return;
        }

        // 2. Отримуємо ачівки, які у користувача ВЖЕ є
        const userAchievements = await prisma.userAchievement.findMany({
            where: { userId: userId },
            include: { achievement: { select: { code: true } } }
        });

        console.log(`[Achievements] 🏆 Користувач ${userId} вже має ${userAchievements.length} ачівок:`, 
            userAchievements.map(ua => ua.achievement.code).join(', ') || 'немає');

        // Створюємо Set (набір) кодів ачівок, які вже є, для швидкої перевірки
        const ownedAchievementCodes = new Set(userAchievements.map(ua => ua.achievement.code));

        // --- Перевірки "Гурмана" (загальна кількість замовлень) ---
        const totalOrders = userOrders.length;
        console.log(`[Achievements] 📈 Перевірка FOODIE ачівок: ${totalOrders} замовлень`);

        if (totalOrders >= 1 && !ownedAchievementCodes.has('FOODIE_1')) {
            console.log(`[Achievements] 🎯 Видаємо FOODIE_1 (${totalOrders} >= 1)`);
            await grantAchievement(userId, 'FOODIE_1');
        }

        if (totalOrders >= 5 && !ownedAchievementCodes.has('FOODIE_2')) {
            console.log(`[Achievements] 🎯 Видаємо FOODIE_2 (${totalOrders} >= 5)`);
            await grantAchievement(userId, 'FOODIE_2');
        }

        if (totalOrders >= 10 && !ownedAchievementCodes.has('FOODIE_3')) {
            console.log(`[Achievements] 🎯 Видаємо FOODIE_3 (${totalOrders} >= 10)`);
            await grantAchievement(userId, 'FOODIE_3');
        }

        // --- Перевірки "Дослідника" (унікальні ресторани) ---
        const distinctRestaurants = new Set(userOrders.map(o => o.restaurantId));
        const totalDistinctRestaurants = distinctRestaurants.size;
        console.log(`[Achievements] 🗺️ Перевірка EXPLORER ачівок: ${totalDistinctRestaurants} унікальних ресторанів`);

        if (totalDistinctRestaurants >= 3 && !ownedAchievementCodes.has('EXPLORER_1')) {
            console.log(`[Achievements] 🎯 Видаємо EXPLORER_1 (${totalDistinctRestaurants} >= 3)`);
            await grantAchievement(userId, 'EXPLORER_1');
        }

        if (totalDistinctRestaurants >= 5 && !ownedAchievementCodes.has('EXPLORER_2')) {
            console.log(`[Achievements] 🎯 Видаємо EXPLORER_2 (${totalDistinctRestaurants} >= 5)`);
            await grantAchievement(userId, 'EXPLORER_2');
        }

        console.log(`[Achievements] ✅ Перевірка ачівок для користувача ${userId} завершена`);
    } catch (error) {
        console.error(`[Achievements] ❌ Помилка при перевірці ачівок для користувача ${userId}:`, error);
        // Не кидаємо помилку далі, щоб не порушити основний процес
    }
}

