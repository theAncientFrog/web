// app/api/items/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('category');
    const restaurantId = searchParams.get('restaurantId');

    console.log('Items API called with:', { categoryName, restaurantId });

    // Тимчасово повертаємо тестові дані
    const mockItems = [
      {
        id: 101,
        name: 'Тестова страва 1',
        price: 150,
        description: 'Опис тестової страви 1',
        imageUrl: '/images/test1.jpg'
      },
      {
        id: 102,
        name: 'Тестова страва 2',
        price: 250,
        description: 'Опис тестової страви 2',
        imageUrl: '/images/test2.jpg'
      }
    ];

    console.log('Returning mock items');
    return NextResponse.json(mockItems, { status: 200 });
  } catch (error) {
    console.error('Error in items API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
