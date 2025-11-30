// app/components/MenuItem.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface MenuItemProps {
    dish: {
        id: number;
        name: string;
        price: number;
        imageUrl?: string | null;
        description?: string | null;
    };
    restaurantId: string;
    discount?: number; // Знижка в відсотках
}

const MenuItem = ({ dish, restaurantId, discount = 0 }: MenuItemProps) => {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    // Розраховуємо ціну зі знижкою
    const originalPrice = dish.price;
    const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;

    const handleAddToCart = () => {
        setIsAdding(true);
        // Додаємо до кошика з оригінальною ціною (знижка застосовується при оплаті)
        addToCart(
            {
                id: dish.id,
                name: dish.name,
                price: originalPrice, // Зберігаємо оригінальну ціну
                imageUrl: dish.imageUrl || '/images/placeholder.jpg',
            },
            restaurantId
        );
        setTimeout(() => setIsAdding(false), 300);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-200 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
            {/* Зображення страви */}
            <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                <Image
                    src={dish.imageUrl || '/images/placeholder.jpg'}
                    alt={dish.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            {/* Контент картки */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Назва страви */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {dish.name}
                </h3>

                {/* Опис (якщо є) */}
                {dish.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-grow">
                        {dish.description}
                    </p>
                )}

                {/* Ціна та кнопка */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col">
                        {discount > 0 ? (
                            <>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {discountedPrice.toFixed(2)} грн
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                    {originalPrice.toFixed(2)} грн
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {originalPrice.toFixed(2)} грн
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-full p-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        aria-label={`Додати ${dish.name} до кошика`}
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuItem;
