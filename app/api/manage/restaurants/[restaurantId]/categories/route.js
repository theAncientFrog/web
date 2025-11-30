import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
// ❗️ ВИПРАВЛЕНО: Шлях до authOptions, ймовірно, веде до 'lib', а не до '[...nextauth]'
import { authOptions } from '../../../../../../lib/auth.config';
import prisma from '../../../../../../lib/prisma';

// --- GET: Отримати категорії для конкретного ресторану ---
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    const restaurantId = parseInt(params.restaurantId); // Отримуємо ID ресторану з URL

    // 💡 1. БЛОК ДЛЯ ДЕБАГУ (тепер всередині функції)
    console.log("--- DEBUG: GET CATEGORIES API ---");
    console.log("SESSION:", JSON.stringify(session, null, 2));
    console.log("REQUESTED Restaurant ID:", restaurantId);
    // 💡 2. КІНЕЦЬ БЛОКУ ДЕБАГУ

    // Перевірка авторизації та ID
    if (!session?.user?.email || session.user.role !== 'OWNER' || isNaN(restaurantId)) {
        console.error("DEBUG: FAILED CHECK 1 (401 Unauthorized)"); // ⬅️ Додатковий лог
        return NextResponse.json({ error: 'Unauthorized or Invalid ID' }, { status: 401 });
    }

    try {
        // Перевіряємо, чи цей ресторан належить поточному власнику
        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: restaurantId,
                owner: { email: session.user.email }, // Перевірка власника
            },
        });

        if (!restaurant) {
            console.error("DEBUG: FAILED CHECK 2 (404 Not Found - Not owner or not exist)"); // ⬅️ Додатковий лог
            return NextResponse.json({ error: 'Restaurant not found or access denied' }, { status: 404 });
        }

        // Отримуємо категорії цього ресторану
        // Спочатку отримуємо всі категорії (і батьківські, і дочірні)
        const allCategories = await prisma.category.findMany({
            where: {
                restaurantId: restaurantId,
            },
            include: {
                _count: {
                    select: {
                        dishes: true,
                        subcategories: true,
                    },
                },
                subcategories: {
                    include: {
                        _count: {
                            select: {
                                dishes: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        
        // Для зручності обробки, зберігаємо всі категорії
        const categories = allCategories;

        // Додаємо item_count до кожної категорії
        // Для головних категорій (parentId == null) - рахуємо страви з усіх підкатегорій
        // Для підкатегорій (parentId != null) - рахуємо безпосередньо прив'язані страви
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const { _count, subcategories, ...categoryWithoutCount } = category;
                
                let itemCount = 0;
                
                if (category.parentId === null) {
                    // Головна категорія - рахуємо страви з усіх підкатегорій
                    const subcategoryIds = subcategories.map(sub => sub.id);
                    if (subcategoryIds.length > 0) {
                        itemCount = await prisma.dish.count({
                            where: {
                                categoryId: {
                                    in: subcategoryIds,
                                },
                            },
                        });
                    }
                } else {
                    // Підкатегорія - рахуємо безпосередньо прив'язані страви
                    itemCount = _count.dishes;
                }
                
                // Обробляємо підкатегорії, додаючи item_count до кожної
                const subcategoriesWithCount = subcategories.map(sub => ({
                    ...sub,
                    item_count: sub._count.dishes,
                }));
                
                return {
                    ...categoryWithoutCount,
                    item_count: itemCount,
                    subcategories: subcategoriesWithCount,
                };
            })
        );

        return NextResponse.json(categoriesWithCount, { status: 200 });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// --- POST: Створити нову категорію для ресторану ---
export async function POST(request, { params }) {
    const session = await getServerSession(authOptions);
    const restaurantId = parseInt(params.restaurantId);

    if (!session?.user?.email || session.user.role !== 'OWNER' || isNaN(restaurantId)) {
        return NextResponse.json({ error: 'Unauthorized or Invalid ID' }, { status: 401 });
    }

    try {
        // Перевіряємо, чи цей ресторан належить поточному власнику
        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: restaurantId,
                owner: { email: session.user.email },
            },
        });

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found or access denied' }, { status: 404 });
        }

        // Отримуємо дані з тіла запиту
        const data = await request.json();
        if (!data.name) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        // Перевіряємо, чи батьківська категорія існує і належить цьому ресторану (якщо вказана)
        if (data.parentId) {
            const parentCategory = await prisma.category.findFirst({
                where: {
                    id: data.parentId,
                    restaurantId: restaurantId,
                    parentId: null, // Батьківська категорія не може мати свого батька
                },
            });

            if (!parentCategory) {
                return NextResponse.json({ error: 'Parent category not found or invalid' }, { status: 400 });
            }
        }

        // Створюємо нову категорію
        const newCategory = await prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                iconName: data.iconName || null, // Іконка тільки для батьківських категорій
                parentId: data.parentId || null, // Якщо вказано - створюємо підкатегорію
                restaurantId: restaurantId, // Прив'язуємо до ресторану
            },
        });

        return NextResponse.json(newCategory, { status: 201 });

    } catch (error) {
        console.error('Error creating category:', error);
        if (error.code === 'P2002') { // Перевірка на унікальність (якщо потрібно)
            return NextResponse.json({ error: 'Category with this name already exists in this restaurant' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
