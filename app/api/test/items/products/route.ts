// app/api/products/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('category');
    const restaurantId = searchParams.get('restaurantId');

    console.log('Products API called with:', { categoryName, restaurantId });

    // Тимчасово повертаємо тестові дані
    const mockProducts = [
      {
        id: 1,
        name: 'Test Product 1',
        price: 100,
        description: 'Test description 1',
        imageUrl: '/images/test1.jpg'
      },
      {
        id: 2,
        name: 'Test Product 2',
        price: 200,
        description: 'Test description 2',
        imageUrl: '/images/test2.jpg'
      }
    ];

    console.log('Returning mock products');
    return NextResponse.json(mockProducts, { status: 200 });
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
