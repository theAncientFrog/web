// app/components/EstablishmentsSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RestaurantCard from './RestaurantCard'; 
import { ArrowRight } from 'lucide-react'; // Використовуємо стрілку

// Тип для даних (як у API)
interface RestaurantPreview {
    id: number;
    name: string;
    description?: string;
    address?: string;
    logoUrl?: string;
    bannerUrl?: string;
    stars?: number;
}

export default function EstablishmentsSection() {
    const [restaurants, setRestaurants] = useState<RestaurantPreview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ⬅️ Завантаження даних з API
    useEffect(() => {
        fetch('/api/partners') // Викликаємо наш API, який повертає всі заклади
            .then(res => {
                 if (!res.ok) throw new Error('Failed to fetch data.');
                 return res.json();
            })
            .then(data => {
                setRestaurants(data);
            })
            .catch(err => {
                setError('Не вдалося завантажити список закладів.');
                console.error(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // Обмежуємо список до перших 3-х елементів для головної сторінки
    const limitedRestaurants = restaurants.slice(0, 3);

    return (
        // ⬅️ Збільшений вертикальний відступ
        <section className="mt-8 sm:mt-12 md:mt-16"> 
            
            {/* ▼▼▼ ЗАГОЛОВОК ТА КНОПКА ▼▼▼ */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 gap-3 sm:gap-0">
                
                {/* ⬅️ Задизайнений ЗАГОЛОВОК */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Establishments:
                </h2>
                
                {/* ⬅️ Стилізована КНОПКА "Переглянути всі" */}
                <Link 
                    href="/partners" 
                    // Використовуємо синій колір, як на вашому скріншоті-зразку
                    className="flex items-center text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-800 dark:hover:text-indigo-300 whitespace-nowrap p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 no-underline"
                >
                    Переглянути всі
                    <ArrowRight size={18} className="sm:w-5 sm:h-5 ml-1" />
                </Link>
            </div>
            {/* ▲▲▲ КІНЕЦЬ ЗАГОЛОВКУ ▲▲▲ */}

            {isLoading ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4 sm:py-6 text-sm sm:text-base">Завантаження закладів...</div>
            ) : error ? (
                <div className="text-center text-red-600 dark:text-red-400 py-4 sm:py-6 text-sm sm:text-base">{error}</div>
            ) : limitedRestaurants.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4 sm:py-6 text-sm sm:text-base">Наразі немає доступних закладів.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {limitedRestaurants.map((restaurant) => (
                        <RestaurantCard 
                            key={restaurant.id}
                            restaurant={restaurant}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}