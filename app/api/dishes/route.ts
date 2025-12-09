// app/api/dishes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocaleFromRequest, localizeEntities, type SupportedLocale } from '@/lib/i18n-helpers';
import { categoryTranslations } from '@/lib/en-translations';

// Вказуємо Next.js, що цей роут завжди динамічний (для Vercel)
export const dynamic = 'force-dynamic';

/**
 * Перетворює англійську назву категорії на українську для пошуку в БД
 */
function getUkrainianCategoryName(categoryName: string): string {
  // Створюємо обернений словник: EN -> UA
  const reverseMap: Record<string, string> = {};
  Object.entries(categoryTranslations).forEach(([ua, enData]) => {
    if (enData.nameEn) {
      reverseMap[enData.nameEn.toLowerCase()] = ua;
    }
  });

  const lowerName = categoryName.toLowerCase().trim();
  
  // Перевіряємо точне збігання
  if (reverseMap[lowerName]) {
    return reverseMap[lowerName];
  }

  // Перевіряємо стандартні мапінги (з урахуванням варіантів)
  const standardMappings: Record<string, string> = {
    // Головні категорії
    'food': 'Їжа',
    'beverages': 'Напої',
    'alcoholic beverages': 'Алкоголь',
    'merchandise': 'Мерч',
    'beer': 'Пиво',
    'breakfast': 'Сніданки',
    
    // Підкатегорії - їжа
    'main courses': 'Гарячі страви',
    'main course': 'Гарячі страви',
    'hot dishes': 'Гарячі страви',
    'основні страви': 'Основні страви',
    'soups': 'Супи',
    'salads': 'Салати',
    'desserts': 'Десерти',
    'pastries': 'Випічка',
    'pastry': 'Випічка',
    'fish & seafood': 'Риба та морепродукти',
    'fish and seafood': 'Риба та морепродукти',
    'baguettes & spreads': 'Багети та намазки',
    'baguettes and spreads': 'Багети та намазки',
    'continental breakfasts': 'Континентальні сніданки',
    'egg dishes': 'Яєчні страви',
    'main kitchen': 'Основна кухня',
    'cottage cheese pancakes': 'Сирники',
    'cakes & desserts': 'Торти та десерти',
    'cakes and desserts': 'Торти та десерти',
    'breakfast combos': 'Комбо сніданки',
    'à la carte': 'Окремі страви',
    'individual dishes': 'Окремі страви',
    
    // Підкатегорії - напої
    'coffee': 'Кава',
    'tea': 'Чай',
    'soft drinks': 'Безалкогольні напої',
    'specialty coffee': 'Спеціальна кава',
    'special coffee': 'Спеціальна кава',
    'classic coffee': 'Класична кава',
    'tea & other beverages': 'Чай та інші напої',
    'tea and other beverages': 'Чай та інші напої',
    
    // Підкатегорії - алкоголь
    'wines': 'Вина',
    'wine': 'Вино',
    'cocktails': 'Коктейлі',
    'classic cocktails': 'Класичні коктейлі',
    'signature cocktails': 'Авторські коктейлі',
    'whiskey': 'Віскі',
    'whisky': 'Віскі',
    'craft beer': 'Крафтове пиво',
    'alcoholic drinks': 'Алкогольні напої',
    'alcoholic beverages': 'Алкогольні напої',
    
    // Інше
    'souvenirs': 'Сувеніри',
  };

  // Перевіряємо стандартні мапінги
  if (standardMappings[lowerName]) {
    return standardMappings[lowerName];
  }

  // Якщо не знайдено англійське відповідництво, повертаємо оригінальну назву
  // (можливо вона вже українською)
  return categoryName;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('category');
    const restaurantId = searchParams.get('restaurantId');

    if (!categoryName || !restaurantId) {
      return NextResponse.json(
        { error: 'Необхідно вказати "category" та "restaurantId"' },
        { status: 400 }
      );
    }

    // Визначаємо локаль з запиту
    const locale = getLocaleFromRequest(request);
    
    // Перетворюємо назву категорії на українську для пошуку в БД
    // (БД містить українські назви, але API може отримати англійські)
    const uaCategoryName = getUkrainianCategoryName(categoryName);
    
    const numericRestaurantId = Number(restaurantId);
    let dishes = [];

    // Функція для отримання страв з підкатегорій головної категорії
    const getDishesByMainCategory = async (mainCategoryName: string) => {
      return await prisma.dish.findMany({
        where: {
          category: {
            parent: {
              name: mainCategoryName,
              restaurantId: numericRestaurantId
            }
          }
        },
        select: {
          id: true,
          name: true,
          nameEn: true,
          description: true,
          descriptionEn: true,
          price: true,
          calories: true,
          allergens: true,
          allergensEn: true,
          imageUrl: true,
          categoryId: true,
        }
      });
    };

    // Спочатку перевіряємо, чи це назва головної категорії (українською)
    if (uaCategoryName === 'Їжа') {
      dishes = await getDishesByMainCategory('Їжа');
    } else if (uaCategoryName === 'Напої') {
      dishes = await getDishesByMainCategory('Напої');
    } else if (uaCategoryName === 'Алкоголь') {
      dishes = await getDishesByMainCategory('Алкоголь');
    } else if (uaCategoryName === 'Мерч') {
      dishes = await getDishesByMainCategory('Мерч');
    } else if (uaCategoryName === 'Пиво') {
      dishes = await getDishesByMainCategory('Пиво');
    } else {
      // Шукаємо в конкретній субкатегорії (використовуємо українську назву)
      // Також перевіряємо обидві версії назви (ua та en) на випадок якщо назва не перетворилась
      dishes = await prisma.dish.findMany({
        where: {
          OR: [
            {
              category: {
                name: uaCategoryName,
                restaurantId: numericRestaurantId
              }
            },
            {
              category: {
                nameEn: categoryName, // На випадок якщо в БД вже є англійські назви
                restaurantId: numericRestaurantId
              }
            },
            {
              category: {
                name: categoryName, // На випадок якщо назва вже була українською
                restaurantId: numericRestaurantId
              }
            }
          ]
        },
        select: {
          id: true,
          name: true,
          nameEn: true,
          description: true,
          descriptionEn: true,
          price: true,
          calories: true,
          allergens: true,
          allergensEn: true,
          imageUrl: true,
          categoryId: true,
        }
      });
    }

    // Локалізуємо страви відповідно до мови
    const localizedDishes = localizeEntities(dishes, locale);

    // Додаємо заголовки для кешування та SEO
    return NextResponse.json(localizedDishes, {
      status: 200,
      headers: {
        'Content-Language': locale,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Vary': 'Accept-Language, x-lang',
      }
    });
  } catch (error) {
    console.error('Error fetching dishes:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
