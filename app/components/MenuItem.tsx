// app/components/MenuItem.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';
import DishModal from './DishModal';

interface MenuItemProps {
    dish: {
        id: number;
        name: string;
        nameEn?: string | null;
        price: number;
        imageUrl?: string | null;
        description?: string | null;
        descriptionEn?: string | null;
        calories?: number | null;
        allergens?: string | null;
    };
    restaurantId: string;
    discount?: number; // Знижка в відсотках
}

const MenuItem = ({ dish, restaurantId, discount = 0 }: MenuItemProps) => {
    const { t, i18n } = useTranslation();
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [showCalories, setShowCalories] = useState(true);
    const [showAllergens, setShowAllergens] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // API вже повертає локалізовані дані (без nameEn, descriptionEn, allergensEn)
    // Тому просто використовуємо name, description, allergens, які вже містять правильну мову
    const dishName = dish.name || '';
    const dishDescription = dish.description || null;
    const dishAllergens = dish.allergens || '';

    // Завантажуємо налаштування з localStorage та слухаємо зміни
    useEffect(() => {
        const loadSettings = () => {
            const savedShowCalories = localStorage.getItem('menu_showCalories');
            const savedShowAllergens = localStorage.getItem('menu_showAllergens');
            
            if (savedShowCalories !== null) setShowCalories(savedShowCalories === 'true');
            if (savedShowAllergens !== null) setShowAllergens(savedShowAllergens === 'true');
        };

        loadSettings();

        // Слухаємо зміни в localStorage
        const handleStorageChange = (e) => {
            if (e.key === 'menu_showCalories' || e.key === 'menu_showAllergens') {
                loadSettings();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Також слухаємо події на тому ж вікні (для синхронізації між компонентами)
        const handleCustomStorageChange = () => {
            loadSettings();
        };
        
        window.addEventListener('menuSettingsChanged', handleCustomStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('menuSettingsChanged', handleCustomStorageChange);
        };
    }, []);

    // Розраховуємо ціну зі знижкою
    const originalPrice = dish.price;
    const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
    
    // Перевіряємо, чи є калорійність та алергени
    const hasCalories = dish.calories !== null && dish.calories !== undefined && dish.calories > 0;
    const hasAllergens = dish.allergens && dish.allergens.trim().length > 0;

    const handleAddToCart = () => {
        setIsAdding(true);
        // Додаємо до кошика з локалізованою назвою
        // API вже видаляє nameEn після локалізації, тому використовуємо тільки name
        addToCart(
            {
                id: dish.id,
                name: dishName, // Локалізована назва (вже від API)
                price: originalPrice, // Зберігаємо оригінальну ціну
                imageUrl: dish.imageUrl || '/images/placeholder.jpg',
            },
            restaurantId
        );
        setTimeout(() => setIsAdding(false), 300);
    };

    return (
        <>
            <DishModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                dish={dish}
                restaurantId={restaurantId}
                discount={discount}
            />
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-200 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col cursor-pointer"
                onClick={() => setIsModalOpen(true)}
            >
            {/* Зображення страви */}
            <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                <Image
                    src={dish.imageUrl || '/images/placeholder.jpg'}
                    alt={dishName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            {/* Контент картки */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Назва страви */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {dishName}
                </h3>

                {/* Опис (якщо є) */}
                {dishDescription && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-grow">
                        {dishDescription}
                    </p>
                )}

                {/* Калорійність та алергени */}
                <div className="mb-3 space-y-2">
                    {/* Калорійність */}
                    {hasCalories && showCalories && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{t('menu.calories_label')}:</span>
                            <span>{dish.calories} {t('menu.kcal')}</span>
                        </div>
                    )}
                    
                    {/* Алергени */}
                    {hasAllergens && showAllergens && dishAllergens && (
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">{t('menu.allergens_label')}:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {dishAllergens.split(',').map((allergen, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                                    >
                                        {allergen.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Ціна та кнопка */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col">
                        {discount > 0 ? (
                            <>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {discountedPrice.toFixed(2)} {t('menu.currency')}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                    {originalPrice.toFixed(2)} {t('menu.currency')}
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {originalPrice.toFixed(2)} {t('menu.currency')}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart();
                        }}
                        disabled={isAdding}
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-full p-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        aria-label={`${t('menu.add_to_cart')} ${dishName}`}
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default MenuItem;
