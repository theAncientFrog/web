import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
// 💡 ВИПРАВЛЕНО: Використання @/
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';

// --- Функція для перевірки доступу власника до товару ---
async function verifyOwnerAccess(session, restaurantId, categoryId, itemId) {
    console.log('Verifying access for:', {
        sessionEmail: session?.user?.email,
        role: session?.user?.role,
        restaurantId,
        categoryId,
        itemId
    });

    if (!session?.user?.email || session.user.role !== 'OWNER' || isNaN(restaurantId) || isNaN(categoryId) || isNaN(itemId)) {
        console.log('Basic check failed:', { session, restaurantId, categoryId, itemId });
        return false;
    }
    try {
        const item = await prisma.dish.findFirst({
            where: {
                id: itemId,
                categoryId: categoryId,
                category: {
                    restaurantId: restaurantId,
                    restaurant: {
                        owner: { email: session.user.email },
                    },
                },
            },
            select: {
                id: true,
                name: true,
            }
        });

        console.log('Item found by Prisma in verifyOwnerAccess:', item);
        return !!item;
    } catch (error) {
        console.error('Error in verifyOwnerAccess Prisma query:', error);
        return false;
    }
}

// --- PUT: Оновити товар ---
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);

    const restaurantId = parseInt(params.restaurantId, 10);
    const categoryId = parseInt(params.categoryId, 10);
    const itemId = parseInt(params.itemId, 10);

    const hasAccess = await verifyOwnerAccess(session, restaurantId, categoryId, itemId);
    if (!hasAccess) {
        return NextResponse.json({ error: 'Item not found or access denied' }, { status: 404 });
    }

    try {
        const data = await request.json();

        // Валідація
        const price = data.price !== undefined ? parseFloat(data.price) : undefined;
        const calories = data.calories !== undefined ? (data.calories === null || data.calories === '' ? null : parseInt(data.calories)) : undefined;

        if (data.price !== undefined && isNaN(price)) {
            return NextResponse.json({ error: 'Price must be a number' }, { status: 400 });
        }
        if (data.calories !== undefined && data.calories !== null && data.calories !== '' && isNaN(calories)) {
            return NextResponse.json({ error: 'Calories must be a number' }, { status: 400 });
        }

        const updatedItem = await prisma.dish.update({
            where: { id: itemId },
            data: {
                name: data.name,
                description: data.description,
                price: price,
                calories: calories,
                imageUrl: data.imageUrl,
            },
        });

        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// --- DELETE: Видалити товар ---
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);

    const restaurantId = parseInt(params.restaurantId, 10);
    const categoryId = parseInt(params.categoryId, 10);
    const itemId = parseInt(params.itemId, 10);

    console.log(`--- DELETE request received for item ${itemId} ---`);

    const hasAccess = await verifyOwnerAccess(session, restaurantId, categoryId, itemId);
    if (!hasAccess) {
        console.log(`Access denied or item not found for delete request.`);
        return NextResponse.json({ error: 'Item not found or access denied' }, { status: 404 });
    }

    try {
        console.log(`Attempting to delete dish with id: ${itemId}`);
        await prisma.dish.delete({
            where: { id: itemId },
        });
        console.log(`Successfully deleted dish with id: ${itemId}`);

        return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting item:', error);
        if (error.code === 'P2025') {
            console.log(`Prisma error P2025: Record to delete does not exist.`);
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
