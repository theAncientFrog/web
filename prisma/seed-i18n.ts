/**
 * Seed скрипт для додавання багатомовних даних
 * 
 * ⚠️ ВАЖЛИВО: Перед запуском виконайте:
 * npx prisma generate
 * 
 * Це необхідно, щоб Prisma Client знав про поля nameEn, descriptionEn, allergensEn
 * 
 * Використання:
 * npx tsx prisma/seed-i18n.ts
 * або
 * npm run seed:i18n
 */

import { PrismaClient } from '@prisma/client';
import { dishTranslations, categoryTranslations, translateAllergens } from '../lib/en-translations';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding i18n data...');
  console.log('📚 Using professional restaurant-grade English translations\n');

  // Оновлення всіх страв з англійськими перекладами
  const dishes = await prisma.dish.findMany({
    where: {
      OR: [
        { nameEn: null },
        { nameEn: '' },
      ],
    } as any,
  });

  console.log(`📋 Found ${dishes.length} dishes without English translations\n`);

  let updatedDishes = 0;
  for (const dish of dishes) {
    const translation = dishTranslations[dish.name];
    if (translation) {
      // Перекладаємо алергени
      const allergensEn = dish.allergens 
        ? translateAllergens(dish.allergens) 
        : translation.allergensEn || null;

      await prisma.dish.update({
        where: { id: dish.id },
        data: {
          nameEn: translation.nameEn,
          descriptionEn: translation.descriptionEn || (dish as any).descriptionEn || null,
          allergensEn: allergensEn,
        } as any,
      });
      console.log(`✅ Updated dish: ${dish.name} → ${translation.nameEn}`);
      updatedDishes++;
    } else {
      console.warn(`⚠️  No translation found for: ${dish.name}`);
    }
  }

  console.log(`\n📊 Updated ${updatedDishes} out of ${dishes.length} dishes\n`);

  // Оновлення всіх категорій
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { nameEn: null },
        { nameEn: '' },
      ],
    } as any,
  });

  console.log(`📋 Found ${categories.length} categories without English translations\n`);

  let updatedCategories = 0;
  for (const category of categories) {
    const translation = categoryTranslations[category.name];
    if (translation) {
      await prisma.category.update({
        where: { id: category.id },
        data: {
          nameEn: translation.nameEn,
          descriptionEn: translation.descriptionEn || (category as any).descriptionEn || null,
        } as any,
      });
      console.log(`✅ Updated category: ${category.name} → ${translation.nameEn}`);
      updatedCategories++;
    } else {
      console.warn(`⚠️  No translation found for category: ${category.name}`);
    }
  }

  console.log(`\n📊 Updated ${updatedCategories} out of ${categories.length} categories`);
  console.log('\n✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

