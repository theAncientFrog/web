import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../../../lib/auth.config';
import prisma from '../../../../../../../lib/prisma';

// --- PUT: Оновити категорію ---
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    const restaurantId = parseInt(params.restaurantId);
    const categoryId = parseInt(params.categoryId);

    if (!session?.user?.email || session.user.role !== 'OWNER' || isNaN(restaurantId) || isNaN(categoryId)) {
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

        // Перевіряємо, чи категорія існує і належить цьому ресторану
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                restaurantId: restaurantId,
            },
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
        }

        // Отримуємо дані з тіла запиту
        const data = await request.json();
        if (!data.name) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        // Оновлюємо категорію
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: {
                name: data.name,
                description: data.description || null,
                iconName: data.iconName || null, // Оновлюємо назву іконки
            },
        });

        return NextResponse.json(updatedCategory, { status: 200 });

    } catch (error) {
        console.error('Error updating category:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Category with this name already exists in this restaurant' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

