// app/components/EstablishmentsSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
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
    const { t, i18n } = useTranslation();
    const [restaurants, setRestaurants] = useState<RestaurantPreview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const currentLang = i18n.language || 'ua';
        fetch('/api/partners', {
            headers: {
                'Accept-Language': currentLang,
                'x-lang': currentLang,
            }
        }) // Викликаємо наш API, який повертає всі заклади
            .then(res => {
                 if (!res.ok) {
                     console.error('API Error:', res.status, res.statusText);
                     throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                 }
                 return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setRestaurants(data);
                } else {
                    console.error('Invalid response format:', data);
                    setError(t('common.failed_to_load_establishments'));
                }
            })
            .catch(err => {
                console.error('Failed to load establishments:', err);

                let errorMessage = t('common.failed_to_load_establishments');

                // Обробляємо різні типи помилок
                if (err.name === 'AbortError') {
                    errorMessage = t('common.request_timeout', { defaultValue: 'Request timeout' });
                } else if (err.message.includes('fetch')) {
                    errorMessage = t('common.network_error', { defaultValue: 'Network error' });
                }

                // Показуємо більш детальну помилку в режимі розробки
                if (process.env.NODE_ENV === 'development') {
                    setError(`${errorMessage}: ${err.message}`);
                } else {
                    setError(errorMessage);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [i18n.language, t]);

    // Обмежуємо список до перших 3-х елементів для головної сторінки
    const limitedRestaurants = restaurants.slice(0, 3);

    return (
        <section className="mt-8 sm:mt-12 md:mt-16"> 
            
            {/* ▼▼▼ ЗАГОЛОВОК ТА КНОПКА ▼▼▼ */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 gap-3 sm:gap-0">
                
                {/* ⬅️ Задизайнений ЗАГОЛОВОК */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {t('common.establishments')}:
                </h2>
                
                {/* ⬅️ Стилізована КНОПКА "Переглянути всі" */}
                <Link 
                    href="/partners" 
                    // Використовуємо синій колір, як на вашому скріншоті-зразку
                    className="flex items-center text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-800 dark:hover:text-indigo-300 whitespace-nowrap p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 no-underline"
                >
                    {t('banners.view_all')}
                    <ArrowRight size={18} className="sm:w-5 sm:h-5 ml-1" />
                </Link>
            </div>
            {/* ▲▲▲ КІНЕЦЬ ЗАГОЛОВКУ ▲▲▲ */}

            {isLoading ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4 sm:py-6 text-sm sm:text-base">{t('common.loading_establishments')}</div>
            ) : error ? (
                <div className="text-center text-red-600 dark:text-red-400 py-4 sm:py-6 text-sm sm:text-base">{error || t('common.failed_to_load_establishments')}</div>
            ) : limitedRestaurants.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4 sm:py-6 text-sm sm:text-base">{t('common.no_establishments_available')}</div>
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