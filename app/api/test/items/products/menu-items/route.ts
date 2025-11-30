// app/api/menu-items/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('category');
    const restaurantId = searchParams.get('restaurantId');

    console.log('Menu items API called with:', { categoryName, restaurantId });

    // Тимчасово повертаємо тестові дані
    const mockDishes = [
      { id: 1, name: 'Test Dish 1', price: 100, description: 'Test' },
      { id: 2, name: 'Test Dish 2', price: 200, description: 'Test' }
    ];

    console.log('Returning mock dishes');
    return NextResponse.json(mockDishes, { status: 200 });
  } catch (error) {
    console.error('Error in menu items API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
