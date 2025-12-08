// app/api/comments/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - отримати коментарі для страви
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dishId = searchParams.get('dishId');

    if (!dishId) {
      return NextResponse.json(
        { error: 'dishId is required' },
        { status: 400 }
      );
    }

    const numericDishId = parseInt(dishId);
    if (isNaN(numericDishId)) {
      return NextResponse.json(
        { error: 'Invalid dishId' },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        dishId: numericDishId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST - створити новий коментар
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Будь ласка, увійдіть в систему.' },
        { status: 401 }
      );
    }

    const userIdRaw = session.user.id;
    const numericUserId = typeof userIdRaw === 'string' ? parseInt(userIdRaw) : (userIdRaw as number);
    
    console.log('[Comments API] User ID from session:', {
      raw: userIdRaw,
      type: typeof userIdRaw,
      numeric: numericUserId,
      isNaN: isNaN(numericUserId),
    });
    
    if (isNaN(numericUserId) || !numericUserId) {
      return NextResponse.json(
        { error: 'Помилка ID користувача' },
        { status: 400 }
      );
    }

    // Перевіряємо, чи існує користувач
    const user = await prisma.user.findUnique({
      where: { id: numericUserId },
      select: { id: true, email: true, name: true },
    });

    console.log('[Comments API] User lookup result:', {
      found: !!user,
      userId: numericUserId,
      userData: user,
    });

    // Також перевіряємо всіх користувачів для діагностики
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
      take: 5,
    });
    console.log('[Comments API] Sample users in DB:', allUsers);

    if (!user) {
      return NextResponse.json(
        { 
          error: 'Користувач не знайдено',
          debug: {
            requestedUserId: numericUserId,
            sampleUserIds: allUsers.map(u => u.id),
          }
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { dishId, text } = body;

    if (!dishId || !text || !text.trim()) {
      return NextResponse.json(
        { error: 'dishId and text are required' },
        { status: 400 }
      );
    }

    const numericDishId = parseInt(dishId);
    if (isNaN(numericDishId)) {
      return NextResponse.json(
        { error: 'Invalid dishId' },
        { status: 400 }
      );
    }

    // Перевіряємо, чи існує страва
    const dish = await prisma.dish.findUnique({
      where: { id: numericDishId },
    });

    if (!dish) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          text: text.trim(),
          userId: numericUserId,
          dishId: numericDishId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return NextResponse.json(comment, { status: 201 });
    } catch (dbError: any) {
      console.error('Database error creating comment:', dbError);
      
      // Перевіряємо, чи це помилка foreign key constraint
      if (dbError.code === 'P2003' || dbError.message?.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Помилка: користувач не знайдено в системі. Спробуйте вийти та увійти знову.' },
          { status: 400 }
        );
      }
      
      throw dbError; // Перекидаємо інші помилки
    }
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

